const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/dishes.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✅ 已连接到SQLite数据库');
  }
});

// 初始化数据库表
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT DEFAULT '家常菜',
        difficulty INTEGER DEFAULT 1,
        cooking_time INTEGER DEFAULT 30,
        servings INTEGER DEFAULT 2,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        image TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
        reject(err);
      } else {
        console.log('✅ 数据库表初始化完成');
        // 插入示例数据
        insertSampleData().then(resolve).catch(reject);
      }
    });
  });
};

// 插入示例数据
const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    const checkDataSQL = 'SELECT COUNT(*) as count FROM dishes';
    
    db.get(checkDataSQL, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        const sampleDishes = [
          {
            name: '番茄炒蛋',
            category: '家常菜',
            difficulty: 1,
            cooking_time: 15,
            servings: 2,
            ingredients: JSON.stringify(['鸡蛋 3个', '番茄 2个', '葱花 适量', '盐 少许', '糖 少许', '食用油 适量']),
            instructions: JSON.stringify([
              '鸡蛋打散，加少许盐调味',
              '番茄切块，去皮备用',
              '热锅下油，倒入蛋液炒熟盛起',
              '锅内放少许油，下番茄块炒出汁水',
              '加入炒蛋，调味炒匀即可',
              '撒上葱花装盘'
            ]),
            tags: JSON.stringify(['简单', '下饭', '家常'])
          },
          {
            name: '宫保鸡丁',
            category: '川菜',
            difficulty: 3,
            cooking_time: 25,
            servings: 3,
            ingredients: JSON.stringify(['鸡胸肉 300g', '花生米 100g', '干辣椒 10个', '花椒 1勺', '葱白 2段', '姜蒜 适量', '生抽 2勺', '老抽 1勺', '糖 1勺', '醋 1勺', '料酒 1勺', '淀粉 适量']),
            instructions: JSON.stringify([
              '鸡胸肉切丁，用料酒、生抽、淀粉腌制15分钟',
              '花生米炸至金黄色捞起',
              '调制宫保汁：生抽、老抽、糖、醋、淀粉调成汁',
              '热锅下油，下鸡丁炒至变色盛起',
              '锅内留油，下干辣椒、花椒爆香',
              '下葱白、姜蒜爆香，倒入鸡丁炒匀',
              '倒入宫保汁炒至收汁，最后放入花生米炒匀即可'
            ]),
            tags: JSON.stringify(['川菜', '辣', '经典'])
          }
        ];

        const insertSQL = `
          INSERT INTO dishes (name, category, difficulty, cooking_time, servings, ingredients, instructions, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let completed = 0;
        sampleDishes.forEach(dish => {
          db.run(insertSQL, [
            dish.name, dish.category, dish.difficulty, dish.cooking_time,
            dish.servings, dish.ingredients, dish.instructions, dish.tags
          ], (err) => {
            if (err) {
              console.error('插入示例数据失败:', err.message);
            } else {
              completed++;
              if (completed === sampleDishes.length) {
                console.log('✅ 示例数据插入完成');
                resolve();
              }
            }
          });
        });
      } else {
        console.log('✅ 数据库已有数据，跳过示例数据插入');
        resolve();
      }
    });
  });
};

module.exports = { db, initDatabase };
