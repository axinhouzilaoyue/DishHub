const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const json = (payload, status = 200) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
};

const parseLogId = (value) => {
  const id = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

const getPathLogId = (pathname) => {
  const pathParts = pathname.split('/').filter(Boolean);
  const tail = pathParts[pathParts.length - 1];

  if (!tail || tail === 'logs') {
    return null;
  }

  return parseLogId(tail);
};

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const pathLogId = getPathLogId(url.pathname);

  if (request.method === 'GET') {
    const rawDishId = url.searchParams.get('dish_id');

    if (rawDishId !== null) {
      const dishId = parseLogId(rawDishId);

      if (!dishId) {
        return json({ error: 'Missing or invalid dish_id' }, 400);
      }

      const { results } = await db.prepare(`
        SELECT
          cl.*,
          d.name as dish_name,
          d.image as dish_preview
        FROM cooking_log cl
        JOIN dishes d ON cl.dish_id = d.id
        WHERE cl.dish_id = ?
        ORDER BY cl.cooked_at DESC
      `).bind(dishId).all();

      return json(results);
    }

    const { results } = await db.prepare(`
      SELECT
        cl.*,
        d.name as dish_name,
        d.image as dish_preview
      FROM cooking_log cl
      JOIN dishes d ON cl.dish_id = d.id
      ORDER BY cl.cooked_at DESC
    `).all();

    return json(results);
  }

  if (request.method === 'POST') {
    const data = await request.json();
    const { dish_id, image_url, notes } = data;

    if (!dish_id) {
      return json({ error: 'Missing dish_id' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO cooking_log (dish_id, image_url, notes, cooked_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(dish_id, image_url || null, notes || '').run();

    return json({ success: true, id: result.meta.last_row_id });
  }

  if (request.method === 'PUT') {
    let data = null;

    try {
      data = await request.json();
    } catch {
      return json({ error: 'Invalid JSON payload' }, 400);
    }

    const { id, notes, image_url } = data || {};
    const logId = parseLogId(id) ?? pathLogId ?? parseLogId(url.searchParams.get('id'));

    if (!logId) {
      return json({ error: 'Missing or invalid log id' }, 400);
    }

    const result = await db.prepare(`
      UPDATE cooking_log SET notes = ?, image_url = ? WHERE id = ?
    `).bind(notes || '', image_url || null, logId).run();

    const changes = result?.meta?.changes ?? 0;
    if (changes === 0) {
      return json({ error: 'Log not found' }, 404);
    }

    return json({ success: true });
  }

  if (request.method === 'DELETE') {
    const logId = pathLogId ?? parseLogId(url.searchParams.get('id'));

    if (!logId) {
      return json({ error: 'Missing or invalid log id' }, 400);
    }

    const result = await db.prepare('DELETE FROM cooking_log WHERE id = ?').bind(logId).run();
    const changes = result?.meta?.changes ?? 0;

    if (changes === 0) {
      return json({ error: 'Log not found' }, 404);
    }

    return json({ success: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
