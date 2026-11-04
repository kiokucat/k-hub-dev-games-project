// GET /api/stats
// {
//   games:    { "テトリス": { last10: 過去10分間のアクセス数, total: 総アクセス数 }, ... }
//             ※一度も開かれていないゲームは含まれない（画面側で 0 として扱う）
//   trending: [{ game, recent, prev }]  … 急上昇ゲーム（最大5件）
//   trendMin: 急上昇の集計幅（分）
//   site: 統計モーダル用（日本時間）。Hub = このポータルのトップページ、総合計 = Hub + ゲームを開いた回数
//     { today, month, perHourMonth, perDayMonth, yearAll, yearHub, perDayHubYear, perDayAllYear }
//   平均は、月初／年初と「集計を始めた時刻」の遅いほうから数える
// }
import { query, ensureSchema, json } from './_turso.js';

const MINUTE = 60 * 1000;
const WINDOW_MIN = 10; // 各ゲームの「過去◯分間のアクセス」
const TREND_MIN = 60;  // 急上昇：直近◯分と、その前の◯分を比べる（アクセスが少ないうちは長めに）
const TREND_LIMIT = 5;

const JST = 9 * 60 * MINUTE;

// 日本時間の「今日」「今月」「今年」のキー（hit.js と同じ）
function siteKeys(now) {
  const d = new Date(now + JST).toISOString();
  return {
    day: 'site:day:' + d.slice(0, 10),
    month: 'site:month:' + d.slice(0, 7),
    year: 'site:year:' + d.slice(0, 4),
    gamesYear: 'games:year:' + d.slice(0, 4),
  };
}

// 日本時間の月初・年初（ミリ秒）
function periodStarts(now) {
  const j = new Date(now + JST);
  return {
    month: Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), 1) - JST,
    year: Date.UTC(j.getUTCFullYear(), 0, 1) - JST,
  };
}

const round1 = (n) => Math.round(n * 10) / 10;

function siteSummary(site, sk, now) {
  const start = periodStarts(now);
  const since = site['meta:since'] || now;
  // 経過時間（時間 / 日）。始めたばかりで平均が跳ね上がらないよう、1時間・1日を下限にする
  const hours = (from) => Math.max((now - Math.max(from, since)) / (60 * MINUTE), 1);
  const days = (from) => Math.max(hours(from) / 24, 1);

  const month = site[sk.month] || 0;
  const yearHub = site[sk.year] || 0;
  const yearAll = yearHub + (site[sk.gamesYear] || 0);

  return {
    today: site[sk.day] || 0,
    month,
    perHourMonth: round1(month / hours(start.month)),
    perDayMonth: round1(month / days(start.month)),
    yearAll,
    yearHub,
    perDayHubYear: round1(yearHub / days(start.year)),
    perDayAllYear: round1(yearAll / days(start.year)),
  };
}

export async function onRequestGet({ env }) {
  const now = Date.now();
  const sk = siteKeys(now);
  const since = now - WINDOW_MIN * MINUTE;
  const trendCut = now - TREND_MIN * MINUTE;       // これ以降 = 直近
  const trendFrom = now - 2 * TREND_MIN * MINUTE;  // ここから trendCut まで = その前

  try {
    await ensureSchema(env);

    const [totalRows, recentRows, trendRows, siteRows] = await query(env, [
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
      {
        sql: `SELECT key, value FROM counters WHERE key IN ('meta:since', ?, ?, ?, ?)`,
        args: [sk.day, sk.month, sk.year, sk.gamesYear],
      },
    ]);

    const site = {};
    for (const [key, value] of siteRows) site[key] = value;

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
        site: siteSummary(site, sk, now),
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (e) {
    console.error(e);
    return json({ error: '集計を取得できませんでした' }, 500);
  }
}
