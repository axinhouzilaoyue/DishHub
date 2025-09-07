# DishHub - 家庭菜单管理系统

一个简洁美观的家庭菜单管理系统，让你轻松记录和分享家常菜谱。

## 功能特点

- 📝 轻松添加和编辑菜谱
- 🔍 快速搜索和筛选菜品
- 📱 响应式设计，支持手机和电脑
- 🐳 Docker一键部署
- 💾 本地数据存储，无需复杂配置

## 快速开始

### 使用 Docker（推荐）

```bash
# 克隆项目
git clone https://github.com/axinhouzilaoyue/DishHub.git
cd DishHub

# 一键部署（推荐）
./scripts/deploy.sh

# 或者手动部署（支持新旧版本）
docker compose up -d --build
# 或 docker-compose up -d --build

# 访问应用
# 前端: http://localhost:4000
# 后端API: http://localhost:4001
```

### 本地开发

```bash
# 一键启动开发环境（推荐）
./scripts/dev.sh

# 或者手动启动
npm run install:all
npm run dev
```

### 功能演示

1. **浏览菜品** - 在首页查看所有菜品，支持搜索和分类筛选
2. **查看详情** - 点击菜品卡片查看详细的制作方法和食材
3. **添加菜品** - 点击"添加菜品"按钮，填写菜品信息
4. **编辑菜品** - 在菜品详情页点击"编辑"按钮
5. **删除菜品** - 在菜品详情页点击"删除"按钮

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + SQLite
- **部署**: Docker + Docker Compose

## 项目结构

```
DishHub/
├── client/          # 前端应用
├── server/          # 后端API
├── docker-compose.yml
└── README.md
```

## API 接口

- `GET /api/dishes` - 获取所有菜品（支持分类、搜索、标签筛选）
- `GET /api/dishes/:id` - 获取单个菜品详情
- `POST /api/dishes` - 添加新菜品
- `PUT /api/dishes/:id` - 更新菜品
- `DELETE /api/dishes/:id` - 删除菜品
- `GET /api/dishes/categories` - 获取所有分类
- `GET /api/health` - 健康检查

## 数据结构

### 菜品 (Dish)
```typescript
interface Dish {
  id: number;
  name: string;
  category: string;
  difficulty: number; // 1-5
  cooking_time: number; // 分钟
  servings: number; // 人份
  ingredients: string[];
  instructions: string[];
  image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

## 开发指南

### 添加新功能
1. 后端：在 `server/routes/dishes.js` 添加新的路由
2. 前端：在 `client/src/services/api.ts` 添加API调用
3. 组件：在 `client/src/components/` 创建新组件
4. 页面：在 `client/src/pages/` 创建新页面

### 自定义样式
项目使用 Tailwind CSS，可以在 `client/src/index.css` 中添加自定义样式。

### 数据库
使用 SQLite 数据库，数据文件存储在 `server/data/dishes.db`。
数据库会自动初始化并插入示例数据。

## 部署说明

### 生产环境
1. 确保服务器安装了 Docker 和 Docker Compose
2. 检查环境：`./scripts/check-docker.sh`
3. 一键部署：`./scripts/deploy.sh`
4. 数据会持久化存储在 Docker volume 中

### 常用命令
```bash
# 检查 Docker 环境
./scripts/check-docker.sh

# 部署应用
./scripts/deploy.sh

# 查看日志
docker compose logs -f
# 或 docker-compose logs -f

# 停止服务
docker compose down
# 或 docker-compose down

# 重启服务
docker compose restart
# 或 docker-compose restart
```

### 外网访问配置
项目已配置为绑定到所有网络接口 (`0.0.0.0`)，支持外网访问：
- **前端**: `http://你的服务器IP:4000`
- **后端API**: `http://你的服务器IP:4001`

确保服务器防火墙开放端口：
```bash
# Ubuntu/Debian
sudo ufw allow 4000
sudo ufw allow 4001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --permanent --add-port=4001/tcp
sudo firewall-cmd --reload
```

### 备份数据
```bash
# 备份数据库文件
docker cp dishhub_backend_1:/app/data/dishes.db ./backup_dishes.db

# 恢复数据库文件
docker cp ./backup_dishes.db dishhub_backend_1:/app/data/dishes.db
```
