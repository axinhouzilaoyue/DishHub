const express = require('express');
const { db } = require('../database/init');
const router = express.Router();

// 获取所有菜品
router.get('/', (req, res) => {
  const { category, search, tag } = req.query;
  let sql = 'SELECT * FROM dishes WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR ingredients LIKE ? OR instructions LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (tag) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  sql += ' ORDER BY updated_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('查询菜品失败:', err.message);
      res.status(500).json({ error: '服务器错误' });
      return;
    }

    const dishes = rows.map(row => ({
      ...row,
      ingredients: JSON.parse(row.ingredients || '[]'),
      instructions: JSON.parse(row.instructions || '[]'),
      tags: JSON.parse(row.tags || '[]')
    }));

    res.json(dishes);
  });
});

// 获取所有分类 (必须放在 /:id 路由之前)
router.get('/categories', (req, res) => {
  const sql = 'SELECT DISTINCT category FROM dishes ORDER BY category';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('查询分类失败:', err.message);
      res.status(500).json({ error: '服务器错误' });
      return;
    }

    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// 获取单个菜品
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM dishes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('查询菜品失败:', err.message);
      res.status(500).json({ error: '服务器错误' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: '菜品不存在' });
      return;
    }

    const dish = {
      ...row,
      ingredients: JSON.parse(row.ingredients || '[]'),
      instructions: JSON.parse(row.instructions || '[]'),
      tags: JSON.parse(row.tags || '[]')
    };

    res.json(dish);
  });
});

// 添加新菜品
router.post('/', (req, res) => {
  const {
    name,
    category = '家常菜',
    difficulty = 1,
    cooking_time = 30,
    servings = 2,
    ingredients = [],
    instructions = [],
    image = '',
    tags = [],
    tutorial_url = ''
  } = req.body;

  if (!name || !ingredients.length || !instructions.length) {
    res.status(400).json({ error: '菜名、食材和制作步骤不能为空' });
    return;
  }

  const sql = `
    INSERT INTO dishes (name, category, difficulty, cooking_time, servings, ingredients, instructions, image, tags, tutorial_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    category,
    difficulty,
    cooking_time,
    servings,
    JSON.stringify(ingredients),
    JSON.stringify(instructions),
    image,
    JSON.stringify(tags),
    tutorial_url
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('添加菜品失败:', err.message);
      res.status(500).json({ error: '添加菜品失败' });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      message: '菜品添加成功'
    });
  });
});

// 更新菜品
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    difficulty,
    cooking_time,
    servings,
    ingredients,
    instructions,
    image,
    tags,
    tutorial_url
  } = req.body;

  if (!name || !ingredients?.length || !instructions?.length) {
    res.status(400).json({ error: '菜名、食材和制作步骤不能为空' });
    return;
  }

  const sql = `
    UPDATE dishes 
    SET name = ?, category = ?, difficulty = ?, cooking_time = ?, servings = ?,
        ingredients = ?, instructions = ?, image = ?, tags = ?, tutorial_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    name,
    category,
    difficulty,
    cooking_time,
    servings,
    JSON.stringify(ingredients),
    JSON.stringify(instructions),
    image,
    JSON.stringify(tags),
    tutorial_url,
    id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('更新菜品失败:', err.message);
      res.status(500).json({ error: '更新菜品失败' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: '菜品不存在' });
      return;
    }

    res.json({ message: '菜品更新成功' });
  });
});

// 删除菜品
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM dishes WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('删除菜品失败:', err.message);
      res.status(500).json({ error: '删除菜品失败' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: '菜品不存在' });
      return;
    }

    res.json({ message: '菜品删除成功' });
  });
});

module.exports = router;
