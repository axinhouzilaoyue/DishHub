import { error, getDbOrError, json } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  try {
    const stmt = db.prepare(
      'SELECT DISTINCT category FROM dishes WHERE category IS NOT NULL AND category != "" ORDER BY category COLLATE NOCASE ASC'
    );
    const { results } = await stmt.all();
    return json(results.map((item) => item.category));
  } catch (cause) {
    return error('查询分类失败', 500, 'CATEGORIES_QUERY_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}

