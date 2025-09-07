// client/functions/api/logs/[id].js

/**
 * PUT /api/logs/:id
 * 更新指定的烹饪日志
 */
export async function onRequestPut({ env, params, request }) {
  try {
    const db = env.DB;
    const logId = params.id;

    if (!logId) {
      return new Response(JSON.stringify({ error: '缺少日志ID' }), { status: 400 });
    }

    const { image_url, notes, cooked_at } = await request.json();

    if (!image_url && !notes) {
      return new Response(JSON.stringify({ error: '图片链接和笔记不能都为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查日志是否存在
    const existingLog = await db.prepare('SELECT * FROM cooking_log WHERE id = ?').bind(logId).first();
    if (!existingLog) {
      return new Response(JSON.stringify({ error: '烹饪日志不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 更新日志
    let sql, params_array;
    if (cooked_at) {
      // 如果提供了新的烹饪时间，则更新烹饪时间
      sql = `UPDATE cooking_log SET image_url = ?, notes = ?, cooked_at = ? WHERE id = ?`;
      params_array = [image_url || '', notes || '', cooked_at, logId];
    } else {
      // 否则只更新图片和笔记
      sql = `UPDATE cooking_log SET image_url = ?, notes = ? WHERE id = ?`;
      params_array = [image_url || '', notes || '', logId];
    }

    await db.prepare(sql).bind(...params_array).run();

    return new Response(JSON.stringify({ message: '烹饪日志更新成功' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * DELETE /api/logs/:id
 * 删除指定的烹饪日志
 */
export async function onRequestDelete({ env, params }) {
  try {
    const db = env.DB;
    const logId = params.id;

    if (!logId) {
      return new Response(JSON.stringify({ error: '缺少日志ID' }), { status: 400 });
    }

    // 检查日志是否存在
    const existingLog = await db.prepare('SELECT * FROM cooking_log WHERE id = ?').bind(logId).first();
    if (!existingLog) {
      return new Response(JSON.stringify({ error: '烹饪日志不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 删除日志
    await db.prepare('DELETE FROM cooking_log WHERE id = ?').bind(logId).run();

    return new Response(JSON.stringify({ message: '烹饪日志删除成功' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
