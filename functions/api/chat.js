// GET  /api/chat?after=<id>
//   → { messages: [{ id, ts, name, uid, body }] }  古い順。after を省略すると最新 LIMIT 件
// POST /api/chat  { name, body, uid }
//   → { ok: true }
import { query, json } from './_turso.js';

const LIMIT = 50;           // 1回で返す最大件数
const MAX_BODY = 200;       // 本文の最大文字数
const MAX_NAME = 20;        // 名前の最大文字数
const KEEP = 500;           // DB に残す最新件数（これより古いものは書き込み時にたまに削除）
const RATE_WINDOW_MS = 10 * 1000;
const RATE_MAX = 3;         // 同じIPからは RATE_WINDOW_MS の間に RATE_MAX 件まで

const NO_STORE = { 'Cache-Control': 'no-store' };

// テーブルは初回アクセス時に作る（chat.sql と同じ内容）
let schemaReady = null;
function ensureChatSchema(env) {
  if (!schemaReady) {
    schemaReady = query(env, [
      {
        sql: `CREATE TABLE IF NOT EXISTS chat_messages (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                ts   INTEGER NOT NULL,
                name TEXT    NOT NULL DEFAULT '名無し',
                uid  TEXT    NOT NULL DEFAULT '',
                ip   TEXT    NOT NULL DEFAULT '',
                body TEXT    NOT NULL
              )`,
      },
      { sql: `CREATE INDEX IF NOT EXISTS idx_chat_ip_ts ON chat_messages (ip, ts)` },
    ]).catch((e) => {
      schemaReady = null; // 失敗したら次回やり直す
      throw e;
    });
  }
  return schemaReady;
}

// 制御文字・改行を空白にして、前後と連続する空白を整え、文字数で切る
function clean(value, max) {
  const s = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(s).slice(0, max).join('');
}

// IP はそのまま保存せず、ハッシュの先頭だけをレート制限用に使う
async function hashIp(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('chat:' + ip));
  return Array.from(new Uint8Array(buf).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestGet({ env, request }) {
  const after = Number.parseInt(new URL(request.url).searchParams.get('after') || '', 10);

  try {
    await ensureChatSchema(env);

    const stmt =
      Number.isFinite(after) && after >= 0
        ? {
            sql: `SELECT id, ts, name, uid, body FROM chat_messages
                  WHERE id > ? ORDER BY id ASC LIMIT ${LIMIT}`,
            args: [after],
          }
        : {
            sql: `SELECT id, ts, name, uid, body FROM (
                    SELECT id, ts, name, uid, body FROM chat_messages ORDER BY id DESC LIMIT ${LIMIT}
                  ) ORDER BY id ASC`,
          };

    const [rows] = await query(env, [stmt]);

    return json(
      {
        messages: rows.map(([id, ts, name, uid, body]) => ({
          id: Number(id),
          ts: Number(ts),
          name,
          uid,
          body,
        })),
      },
      200,
      NO_STORE
    );
  } catch (e) {
    console.error(e);
    return json({ error: 'チャットを取得できませんでした' }, 500);
  }
}

export async function onRequestPost({ env, request }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'リクエストが正しくありません' }, 400);
  }

  const body = clean(data?.body, MAX_BODY);
  const name = clean(data?.name, MAX_NAME) || '名無し';
  const uid = /^[0-9a-f]{16}$/.test(data?.uid || '') ? data.uid : '';

  if (!body) return json({ error: 'メッセージを入力してください' }, 400);

  try {
    await ensureChatSchema(env);

    const now = Date.now();
    const ip = await hashIp(request);

    const [recent] = await query(env, [
      {
        sql: `SELECT COUNT(*) FROM chat_messages WHERE ip = ? AND ts >= ?`,
        args: [ip, now - RATE_WINDOW_MS],
      },
    ]);
    if (Number(recent[0][0]) >= RATE_MAX) {
      return json({ error: '送信が早すぎます。少し待ってください' }, 429);
    }

    const stmts = [
      {
        sql: `INSERT INTO chat_messages (ts, name, uid, ip, body) VALUES (?, ?, ?, ?, ?)`,
        args: [now, name, uid, ip, body],
      },
    ];
    // たまに、古いメッセージを消して最新 KEEP 件だけにする
    if (Math.random() < 0.05) {
      stmts.push({
        sql: `DELETE FROM chat_messages
              WHERE id <= (SELECT MAX(id) FROM chat_messages) - ${KEEP}`,
      });
    }
    await query(env, stmts);

    return json({ ok: true }, 200, NO_STORE);
  } catch (e) {
    console.error(e);
    return json({ error: '送信できませんでした' }, 500);
  }
}
