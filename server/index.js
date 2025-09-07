const express = require('express');
const cors = require('cors');
const path = require('path');
const dishRoutes = require('./routes/dishes');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 路由
app.use('/api/dishes', dishRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DishHub API 运行正常' });
});

// 初始化数据库并启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📖 API文档: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});