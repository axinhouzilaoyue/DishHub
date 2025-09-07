// client/functions/api/dishes/categories.js

export async function onRequestGet({ env }) {
  try {
    const db = env.DB;
    const stmt = db.prepare('SELECT DISTINCT category FROM dishes');
    const { results } = await stmt.all();
    const categories = results.map((row) => row.category);
    
    return new Response(JSON.stringify(categories), {
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
