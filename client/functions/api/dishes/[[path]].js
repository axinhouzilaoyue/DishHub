// client/functions/api/dishes/[[path]].js

const parseRow = (row) => ({
  ...row,
  ingredients: JSON.parse(row.ingredients || '[]'),
  instructions: JSON.parse(row.instructions || '[]'),
  tags: JSON.parse(row.tags || '[]'),
});

const buildGetListQuery = (url) => {
  const { search, category, tag } = Object.fromEntries(url.searchParams);
  let sql = 'SELECT * FROM dishes WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR ingredients LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (tag) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  sql += ' ORDER BY updated_at DESC';

  return { sql, params };
};

/**
 * GET /api/dishes -> 返回列表
 * GET /api/dishes/:id -> 返回单个
 */
export async function onRequestGet({ env, params, request }) {
  // 增强错误诊断
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database binding not found. Please check your wrangler.toml or --d1 flag.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const db = env.DB;
    const path = params.path;
    const id = path && path.length > 0 ? path[0] : null;

    if (id) {
      // 获取单个
      const stmt = db.prepare('SELECT * FROM dishes WHERE id = ?').bind(id);
      const row = await stmt.first();
      
      if (!row) {
        return new Response(JSON.stringify({ error: '菜品不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(parseRow(row)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      // 获取列表
      const url = new URL(request.url);
      const { sql, params: queryParams } = buildGetListQuery(url);
      const stmt = db.prepare(sql).bind(...queryParams);
      const { results } = await stmt.all();
      
      return new Response(JSON.stringify(results.map(parseRow)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e) {
    console.error('Error in onRequestGet:', e); // 在终端明确打印错误
    return new Response(JSON.stringify({ 
      error: 'An internal server error occurred.',
      message: e.message,
      stack: e.stack, // 返回详细的堆栈信息
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * POST /api/dishes -> 创建
 */
export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database binding not found.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const db = env.DB;
    const dish = await request.json();

    if (!dish.name || !dish.ingredients?.length || !dish.instructions?.length) {
      return new Response(JSON.stringify({ error: '菜名、食材和制作步骤不能为空' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const sql = `
      INSERT INTO dishes (name, category, difficulty, cooking_time, servings, ingredients, instructions, image, tags, tutorial_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      dish.name,
      dish.category || '家常菜',
      dish.difficulty || 1,
      dish.cooking_time || 30,
      dish.servings || 2,
      JSON.stringify(dish.ingredients || []),
      JSON.stringify(dish.instructions || []),
      dish.image || '',
      JSON.stringify(dish.tags || []),
      dish.tutorial_url || '',
    ];

    const { lastRowId } = await db.prepare(sql).bind(...params).run();
    return new Response(JSON.stringify({ id: lastRowId, message: '菜品添加成功' }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Error in onRequestPost:', e);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * PUT /api/dishes/:id -> 更新
 */
export async function onRequestPut({ env, request, params }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database binding not found.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const db = env.DB;
    const path = params.path;
    const id = path && path.length > 0 ? path[0] : null;

    if (!id) {
       return new Response(JSON.stringify({ error: '缺少菜品ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const dish = await request.json();
    if (!dish.name || !dish.ingredients?.length || !dish.instructions?.length) {
      return new Response(JSON.stringify({ error: '菜名、食材和制作步骤不能为空' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const sql = `
      UPDATE dishes 
      SET name = ?, category = ?, difficulty = ?, cooking_time = ?, servings = ?,
          ingredients = ?, instructions = ?, image = ?, tags = ?, tutorial_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const queryParams = [
      dish.name, dish.category, dish.difficulty, dish.cooking_time, dish.servings,
      JSON.stringify(dish.ingredients), JSON.stringify(dish.instructions), dish.image, JSON.stringify(dish.tags), dish.tutorial_url,
      id
    ];

    const { changes } = await db.prepare(sql).bind(...queryParams).run();
    if (changes === 0) {
      return new Response(JSON.stringify({ error: '菜品不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: '菜品更新成功' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Error in onRequestPut:', e);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * DELETE /api/dishes/:id -> 删除
 */
export async function onRequestDelete({ env, params }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database binding not found.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const db = env.DB;
    const path = params.path;
    const id = path && path.length > 0 ? path[0] : null;

     if (!id) {
       return new Response(JSON.stringify({ error: '缺少菜品ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { changes } = await db.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();
    if (changes === 0) {
      return new Response(JSON.stringify({ error: '菜品不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ message: '菜品删除成功' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Error in onRequestDelete:', e);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
