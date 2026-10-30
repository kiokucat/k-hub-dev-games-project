// Turso (libSQL) に HTTP で繋ぐ共通モジュール（Cloudflare Pages Functions 用、依存パッケージなし）
//
// 環境変数（Cloudflare Pages の「設定 → 変数とシークレット」）
//   TURSO_DATABASE_URL … libsql://xxxx.turso.io
//   TURSO_AUTH_TOKEN   … Turso のトークン
// ※ 名前違いでも動くよう、下の候補のどれかがあれば使う

const URL_KEYS = ['TURSO_DATABASE_URL', 'TURSO_URL', 'TURSO_DB_URL', 'LIBSQL_URL', 'DATABASE_URL'];
const TOKEN_KEYS = ['TURSO_AUTH_TOKEN', 'TURSO_TOKEN', 'TURSO_DB_TOKEN', 'LIBSQL_AUTH_TOKEN', 'AUTH_TOKEN'];

function pick(env, keys) {
  for (const k of keys) {
    if (env && env[k]) return String(env[k]).trim();
  }
  return '';
}

function config(env) {
  const raw = pick(env, URL_KEYS);
  const token = pick(env, TOKEN_KEYS);
  if (!raw || !token) {
    throw new Error('Turso の環境変数がありません（TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定してください）');
  }
  const base = raw.replace(/^(libsql|wss|ws):\/\//, 'https://').replace(/\/+$/, '');
  return { base, token };
}

// JS の値 → Turso の引数形式
function encode(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'boolean') return { type: 'integer', value: v ? '1' : '0' };
  if (typeof v === 'bigint') return { type: 'integer', value: v.toString() };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  }
  return { type: 'text', value: String(v) };
}

// Turso の値 → JS の値（整数は number にする）
function decode(v) {
  if (!v || v.type === 'null') return null;
  if (v.type === 'integer' || v.type === 'float') return Number(v.value);
  if (v.type === 'blob') return v.base64;
  return v.value;
}

/**
 * まとめて実行する。
 * stmts: [{ sql, args? }, ...]
 * 戻り値: 文ごとの行の配列 [[ [列, 列...], ... ], ...]（SELECT 以外は []）
 * opts.transaction: true なら全体を 1 つのトランザクションにする（途中で失敗したら全部取り消し）
 */
export async function query(env, stmts, opts = {}) {
  const { base, token } = config(env);

  const requests = [];
  if (opts.transaction) requests.push({ type: 'execute', stmt: { sql: 'BEGIN' } });
  for (const s of stmts) {
    requests.push({
      type: 'execute',
      stmt: { sql: s.sql, args: (s.args || []).map(encode) },
    });
  }
  if (opts.transaction) requests.push({ type: 'execute', stmt: { sql: 'COMMIT' } });
  requests.push({ type: 'close' });

  const res = await fetch(base + '/v2/pipeline', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Turso HTTP ' + res.status + ' ' + text.slice(0, 200));
  }

  const data = await res.json();
  const results = data.results || [];
  const offset = opts.transaction ? 1 : 0; // BEGIN の分

  const out = [];
  for (let i = 0; i < requests.length - 1; i++) {
    const r = results[i];
    if (!r || r.type === 'error') {
      throw new Error('Turso: ' + ((r && r.error && r.error.message) || '実行に失敗しました'));
    }
    if (i < offset || i >= offset + stmts.length) continue; // BEGIN / COMMIT
    const rows = (r.response && r.response.result && r.response.result.rows) || [];
    out.push(rows.map((row) => row.map(decode)));
  }
  return out;
}

// テーブルが無ければ作る（同じインスタンスの間は 1 回だけ）
let schemaReady = null;

export function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = query(env, [
      { sql: `CREATE TABLE IF NOT EXISTS counters (
                key   TEXT PRIMARY KEY,
                value INTEGER NOT NULL DEFAULT 0
              )` },
      { sql: `CREATE TABLE IF NOT EXISTS hits (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL,
                game TEXT,
                ts   INTEGER NOT NULL
              )` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_hits_kind_ts ON hits (kind, ts)` },
    ]).catch((e) => {
      schemaReady = null; // 失敗したら次のアクセスでやり直す
      throw e;
    });
  }
  return schemaReady;
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
