// client/functions/api/dishes/[id]/logs.js

/**
 * GET /api/dishes/:id/logs
 * 获取指定菜品的烹饪日志列表
 */
export async function onRequestGet({ env, params }) {
  try {
    const db = env.DB;
    const dishId = params.id;

    if (!dishId) {
      return new Response(JSON.stringify({ error: '缺少菜品ID' }), { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM cooking_log WHERE dish_id = ? ORDER BY cooked_at DESC').bind(dishId);
    const { results } = await stmt.all();

    return new Response(JSON.stringify(results), {
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
 * POST /api/dishes/:id/logs
 * 为指定菜品添加一条新的烹饪日志
 */
export async function onRequestPost({ env, params, request }) {
  try {
    const db = env.DB;
    const dishId = params.id;

    if (!dishId) {
      return new Response(JSON.stringify({ error: '缺少菜品ID' }), { status: 400 });
    }

    const { image_url, notes } = await request.json();

    if (!image_url && !notes) {
      return new Response(JSON.stringify({ error: '图片链接和笔记不能都为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = `INSERT INTO cooking_log (dish_id, image_url, notes) VALUES (?, ?, ?)`;
    const { lastRowId } = await db.prepare(sql).bind(dishId, image_url || '', notes || '').run();

    return new Response(JSON.stringify({ id: lastRowId, message: '烹饪日志添加成功' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
