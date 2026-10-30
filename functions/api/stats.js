// GET /api/stats
// {
//   games:    { "テトリス": { last10: 過去10分間のアクセス数, total: 総アクセス数 }, ... }
//             ※一度も開かれていないゲームは含まれない（画面側で 0 として扱う）
//   trending: [{ game, recent, prev }]  … 急上昇ゲーム（最大5件）
//   trendMin: 急上昇の集計幅（分）
// }
import { query, ensureSchema, json } from './_turso.js';

const MINUTE = 60 * 1000;
const WINDOW_MIN = 10; // 各ゲームの「過去◯分間のアクセス」
const TREND_MIN = 60;  // 急上昇：直近◯分と、その前の◯分を比べる（アクセスが少ないうちは長めに）
const TREND_LIMIT = 5;

export async function onRequestGet({ env }) {
  const now = Date.now();
  const since = now - WINDOW_MIN * MINUTE;
  const trendCut = now - TREND_MIN * MINUTE;       // これ以降 = 直近
  const trendFrom = now - 2 * TREND_MIN * MINUTE;  // ここから trendCut まで = その前

  try {
    await ensureSchema(env);

    const [totalRows, recentRows, trendRows] = await query(env, [
      { sql: `SELECT key, value FROM counters WHERE key LIKE 'game:%'` },
      {
        sql: `SELECT game, COUNT(*) FROM hits WHERE kind = 'game' AND ts >= ? GROUP BY game`,
        args: [since],
      },
      {
        // 直近 − その前 がプラスのものだけを、増えた回数の多い順に
        sql: `SELECT game, SUM(ts >= ?) AS recent, SUM(ts < ?) AS prev
              FROM hits
              WHERE kind = 'game' AND ts >= ?
              GROUP BY game
              HAVING recent > prev
              ORDER BY (recent - prev) DESC, recent DESC
              LIMIT ${TREND_LIMIT}`,
        args: [trendCut, trendCut, trendFrom],
      },
    ]);

    const games = {};
    for (const [key, total] of totalRows) {
      games[key.slice('game:'.length)] = { last10: 0, total };
    }
    for (const [game, n] of recentRows) {
      if (!games[game]) games[game] = { last10: 0, total: n };
      games[game].last10 = n;
    }

    return json(
      {
        games,
        trending: trendRows.map(([game, recent, prev]) => ({ game, recent, prev })),
        trendMin: TREND_MIN,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (e) {
    console.error(e);
    return json({ error: '集計を取得できませんでした' }, 500);
  }
}
