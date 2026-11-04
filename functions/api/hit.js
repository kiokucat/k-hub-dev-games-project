// POST /api/hit   { "type": "game", "game": "ゲーム名" }   … ゲームを開いたことを記録
// POST /api/hit   { "type": "site" }                       … サイト自体へのアクセスを記録
// （index.html から呼ばれる）
//   counters … サイトのアクセス数（日本時間）："site:total"（総合計）/ "site:day:YYYY-MM-DD"（その日）/ "site:month:YYYY-MM"（その月）
//   hits     … 1アクセス1行（直近10分・急上昇の集計用）
//   counters … ゲームごとの総アクセス数（キーは "game:ゲーム名"）
import { query, ensureSchema, json } from './_turso.js';

const KEEP_MS = 24 * 60 * 60 * 1000; // hits は直近24時間だけ残す（集計に使うのは直近2時間）
const PRUNE_RATE = 0.02;             // 古い行の掃除は、たまに（約2%のアクセスで）やる
const MAX_NAME = 100;

// 日本時間の「今日」「今月」「今年」のキー
function siteKeys(now) {
  const d = new Date(now + 9 * 60 * 60 * 1000).toISOString(); // 2026-11-04T...
  return {
    day: 'site:day:' + d.slice(0, 10),
    month: 'site:month:' + d.slice(0, 7),
    year: 'site:year:' + d.slice(0, 4),
    gamesYear: 'games:year:' + d.slice(0, 4), // ゲームを開いた回数（今年）
  };
}

// 集計を始めた時刻（ミリ秒）。1日／1時間あたりの平均を、集計前の期間で薄めないために使う
const SINCE_SQL = `INSERT INTO counters (key, value) VALUES ('meta:since', ?)
                   ON CONFLICT(key) DO NOTHING`;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON を読めませんでした' }, 400);
  }

  // サイト自体へのアクセス：総合計・今日・今月・今年のカウンターを 1 ずつ増やす
  if (body && body.type === 'site') {
    try {
      await ensureSchema(env);
      const k = siteKeys(Date.now());
      const up = `INSERT INTO counters (key, value) VALUES (?, 1)
                  ON CONFLICT(key) DO UPDATE SET value = value + 1`;
      await query(
        env,
        [
          { sql: up, args: ['site:total'] },
          { sql: up, args: [k.day] },
          { sql: up, args: [k.month] },
          { sql: up, args: [k.year] },
          { sql: SINCE_SQL, args: [Date.now()] },
        ],
        { transaction: true }
      );
      return json({ ok: true }, 200, { 'Cache-Control': 'no-store' });
    } catch (e) {
      console.error(e);
      return json({ error: '記録できませんでした' }, 500);
    }
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
      {
        sql: `INSERT INTO counters (key, value) VALUES (?, 1)
              ON CONFLICT(key) DO UPDATE SET value = value + 1`,
        args: [siteKeys(now).gamesYear],
      },
      { sql: SINCE_SQL, args: [now] },
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
