# 🍽️ DishHub - 家庭菜单管理系统（Cloudflare 版）

> DishHub 现已标准化为 **Cloudflare-only** 架构：前端、API、数据库全部运行在 Cloudflare 平台。

## ✨ 核心能力

| 能力 | 描述 |
|------|------|
| 📝 菜谱管理 | 添加、编辑、删除菜品，支持食材/步骤/难度/教程链接 |
| 🔍 搜索筛选 | 按关键词与分类筛选，中文输入法友好 |
| 🌍 全球访问 | Pages + Functions 全球边缘网络 |
| 🗄️ 数据托管 | D1 统一存储，支持迁移与备份 |
| 🧯 运维安全 | 提供 D1 导出备份与 smoke 检查脚本 |

## 🖥️ 网页信息架构（多页面）

- `/`：控制台（总览统计、快速入口、最近更新菜品）
- `/library`：菜谱库（关键词 + 分类筛选，统一查看）
- `/dish/new`：新增菜品
- `/dish/:id`：菜品详情（查看、删除、教程链接）
- `/dish/:id/edit`：编辑菜品
- `/settings`：设置与备份（一键导出 D1 SQL）

## 🛠 技术架构

- 前端：`React 18 + TypeScript + Vite + Tailwind`
- API：`Cloudflare Pages Functions`
- 数据库：`Cloudflare D1`（绑定名：`DB`）

## 📁 目录结构

```txt
DishHub/
├── client/
│   ├── functions/api/        # Pages Functions API
│   ├── migrations/           # D1 迁移文件
│   ├── src/                  # React 前端源码
│   └── wrangler.toml         # Wrangler 配置
├── scripts/
│   ├── deploy.sh             # Cloudflare 部署脚本
│   ├── dev.sh                # CF 本地开发脚本
│   ├── backup-d1.sh          # D1 备份脚本
│   └── smoke-cf.sh           # 线上健康检查脚本
└── README.md
```

## 🚀 快速开始

### 1) 准备环境

```bash
# Node.js 18+
npm i -g wrangler
wrangler login
```

### 2) 安装依赖

```bash
npm install
cd client && npm install && cd ..
```

### 3) 本地开发（Cloudflare 运行时）

```bash
./scripts/dev.sh
# 等价于：cd client && wrangler pages dev . --d1=DB
```

## 🌐 部署到 Cloudflare Pages

### 方式 A：一键脚本（推荐）

```bash
# 可选：指定 Pages 项目名和分支
PROJECT_NAME=dishhub BRANCH_NAME=main ./scripts/deploy.sh
```

脚本会执行：
1. 安装依赖
2. 构建前端
3. 应用 D1 迁移（remote）
4. 部署到 Cloudflare Pages

### 方式 B：手动命令

```bash
cd client
npm install
npm run build
wrangler d1 migrations apply DB --remote
wrangler pages deploy dist --project-name dishhub --branch main
```

## 🗃️ D1 迁移与备份

### 迁移

```bash
# 本地 D1
cd client && npm run d1:migrate:local

# 远程 D1
cd client && npm run d1:migrate:remote
```

### 备份（强烈建议部署前执行）

```bash
# 默认备份 dishhub-db 到 backups/<timestamp>/
./scripts/backup-d1.sh

# 指定数据库名
DB_NAME=dishhub-db ./scripts/backup-d1.sh
```

## ✅ 部署后巡检

```bash
BASE_URL=https://<your-pages-domain> ./scripts/smoke-cf.sh
```

将检查：
- `GET /api/health`
- `GET /api/dishes`

## 📡 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/dishes` | 菜品列表（支持 `search/category/tag`） |
| GET | `/api/dishes/:id` | 菜品详情 |
| POST | `/api/dishes` | 创建菜品 |
| PUT | `/api/dishes/:id` | 更新菜品 |
| DELETE | `/api/dishes/:id` | 删除菜品 |
| GET | `/api/dishes/categories` | 分类列表 |
| GET | `/api/admin/stats` | 仪表盘统计数据 |
| GET | `/api/admin/backup` | 导出 SQL 备份（下载） |

### 管理接口安全（可选）

- 可在 Cloudflare Pages / Wrangler 环境变量中设置 `BACKUP_KEY`
- 设置后，调用 `/api/admin/backup` 必须在请求头中带 `x-backup-key`
- 前端“设置与备份”页面支持填写该口令并一键导出

## 🔐 运维建议

- 每次正式部署前先跑：`./scripts/backup-d1.sh`
- 每次部署后跑：`BASE_URL=... ./scripts/smoke-cf.sh`
- 生产改库优先走 `client/migrations/`，避免手工 SQL 漏改

## 📄 License

MIT
