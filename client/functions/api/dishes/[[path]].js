import {
  error,
  getDbOrError,
  json,
  normalizeDishRow,
  readPathId,
  toDishId,
  validateDishPayload,
} from '../_utils.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const buildListQuery = (url) => {
  const search = url.searchParams.get('search')?.trim();
  const category = url.searchParams.get('category')?.trim();
  const tag = url.searchParams.get('tag')?.trim();

  let sql = 'SELECT * FROM dishes WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR ingredients LIKE ? OR instructions LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  if (tag) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  sql += ' ORDER BY updated_at DESC, id DESC';

  return { sql, params };
};

const getDishIdFromParams = (params) => {
  const rawId = readPathId(params?.path);
  if (!rawId) {
    return null;
  }

  return toDishId(rawId);
};

const parseRequestJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const toDbParams = (dish) => {
  return [
    dish.name,
    dish.category,
    dish.difficulty,
    dish.cooking_time,
    dish.servings,
    JSON.stringify(dish.ingredients),
    JSON.stringify(dish.instructions),
    dish.image,
    JSON.stringify(dish.tags),
    dish.tutorial_url,
  ];
};

export async function onRequestGet({ env, request, params }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  try {
    const id = getDishIdFromParams(params);

    if (id) {
      const stmt = db.prepare('SELECT * FROM dishes WHERE id = ?').bind(id);
      const row = await stmt.first();

      if (!row) {
        return error('菜品不存在', 404, 'DISH_NOT_FOUND');
      }

      return json(normalizeDishRow(row));
    }

    if (readPathId(params?.path)) {
      return error('菜品 ID 不合法', 400, 'INVALID_DISH_ID');
    }

    const { sql, params: sqlParams } = buildListQuery(new URL(request.url));
    const { results } = await db.prepare(sql).bind(...sqlParams).all();
    return json((results || []).map(normalizeDishRow));
  } catch (cause) {
    return error('查询菜品失败', 500, 'DISH_QUERY_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}

export async function onRequestPost({ env, request }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  const body = await parseRequestJson(request);
  const validation = validateDishPayload(body);

  if (!validation.ok) {
    return error('请求参数校验失败', 400, 'VALIDATION_FAILED', {
      fields: validation.errors,
    });
  }

  try {
    const insertSql = `
      INSERT INTO dishes (name, category, difficulty, cooking_time, servings, ingredients, instructions, image, tags, tutorial_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `;

    const inserted = await db.prepare(insertSql).bind(...toDbParams(validation.data)).first();

    if (!inserted?.id) {
      return error('创建菜品失败，未返回新记录 ID', 500, 'DISH_CREATE_ID_MISSING');
    }

    return new Response(
      JSON.stringify({ id: inserted.id, message: '菜品添加成功' }),
      {
        status: 201,
        headers: JSON_HEADERS,
      }
    );
  } catch (cause) {
    return error('添加菜品失败', 500, 'DISH_CREATE_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}

export async function onRequestPut({ env, params, request }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  const id = getDishIdFromParams(params);
  if (!id) {
    return error('缺少或非法的菜品 ID', 400, 'INVALID_DISH_ID');
  }

  const body = await parseRequestJson(request);
  const validation = validateDishPayload(body);

  if (!validation.ok) {
    return error('请求参数校验失败', 400, 'VALIDATION_FAILED', {
      fields: validation.errors,
    });
  }

  try {
    const sql = `
      UPDATE dishes
      SET name = ?, category = ?, difficulty = ?, cooking_time = ?, servings = ?,
          ingredients = ?, instructions = ?, image = ?, tags = ?, tutorial_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await db.prepare(sql).bind(...toDbParams(validation.data), id).run();
    const changes = result?.meta?.changes ?? 0;

    if (changes === 0) {
      return error('菜品不存在', 404, 'DISH_NOT_FOUND');
    }

    return json({ message: '菜品更新成功' });
  } catch (cause) {
    return error('更新菜品失败', 500, 'DISH_UPDATE_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}

export async function onRequestDelete({ env, params }) {
  const { db, response } = getDbOrError(env);
  if (response) {
    return response;
  }

  const id = getDishIdFromParams(params);
  if (!id) {
    return error('缺少或非法的菜品 ID', 400, 'INVALID_DISH_ID');
  }

  try {
    const result = await db.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();
    const changes = result?.meta?.changes ?? 0;

    if (changes === 0) {
      return error('菜品不存在', 404, 'DISH_NOT_FOUND');
    }

    return json({ message: '菜品删除成功' });
  } catch (cause) {
    return error('删除菜品失败', 500, 'DISH_DELETE_FAILED', {
      cause: String(cause?.message || cause),
    });
  }
}

