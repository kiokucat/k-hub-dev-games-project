// POST /api/hit   { "type": "game", "game": "ゲーム名" }
// ゲームを開いたことを記録する（index.html の sendHit から呼ばれる）
//   hits     … 1アクセス1行（直近10分・急上昇の集計用）
//   counters … ゲームごとの総アクセス数（キーは "game:ゲーム名"）
import { query, ensureSchema, json } from './_turso.js';

const KEEP_MS = 24 * 60 * 60 * 1000; // hits は直近24時間だけ残す（集計に使うのは直近2時間）
const PRUNE_RATE = 0.02;             // 古い行の掃除は、たまに（約2%のアクセスで）やる
const MAX_NAME = 100;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON を読めませんでした' }, 400);
  }

  const game = body && typeof body.game === 'string' ? body.game.trim() : '';
  if (!body || body.type !== 'game' || !game || game.length > MAX_NAME) {
    return json({ error: 'type が game で、game にゲーム名が必要です' }, 400);
  }

  const now = Date.now();

  try {
    await ensureSchema(env);

    const stmts = [
      { sql: `INSERT INTO hits (kind, game, ts) VALUES ('game', ?, ?)`, args: [game, now] },
      {
        sql: `INSERT INTO counters (key, value) VALUES (?, 1)
              ON CONFLICT(key) DO UPDATE SET value = value + 1`,
        args: ['game:' + game],
      },
    ];
    if (Math.random() < PRUNE_RATE) {
      stmts.push({ sql: `DELETE FROM hits WHERE ts < ?`, args: [now - KEEP_MS] });
    }

    await query(env, stmts, { transaction: true });
    return json({ ok: true }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) {
    console.error(e);
    return json({ error: '記録できませんでした' }, 500);
  }
}
