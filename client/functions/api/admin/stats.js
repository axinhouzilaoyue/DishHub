import { error, getDbOrError, json } from '../_utils.js';

const toNumber = (value) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const checkCookingLogTable = async (db) => {
  const stmt = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'cooking_log' LIMIT 1");
  const row = await stmt.first();
  return Boolean(row);
};

export async function onRequestGet({ env }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  try {
    const summaryStmt = db.prepare(`
      SELECT
        COUNT(*) AS total_dishes,
        COUNT(DISTINCT CASE WHEN category IS NOT NULL AND category != '' THEN category END) AS total_categories,
        MAX(updated_at) AS last_updated
      FROM dishes
    `);

    const summary = await summaryStmt.first();
    const hasCookingLog = await checkCookingLogTable(db);

    let totalLogs = 0;
    if (hasCookingLog) {
      const logsRow = await db.prepare('SELECT COUNT(*) AS total_logs FROM cooking_log').first();
      totalLogs = toNumber(logsRow?.total_logs);
    }

    return json({
      total_dishes: toNumber(summary?.total_dishes),
      total_categories: toNumber(summary?.total_categories),
      total_logs: totalLogs,
      last_updated: summary?.last_updated ?? null,
    });
  } catch (cause) {
    return error('查询统计信息失败', 500, 'ADMIN_STATS_QUERY_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}
