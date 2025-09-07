# 🍽️ DishHub - 家庭菜单管理系统

> 一个简洁美观的家庭菜单管理系统，让你轻松记录和分享家常菜谱

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 📝 **菜谱管理** | 添加、编辑、删除菜品，支持食材、步骤、难度等详细信息 |
| 🔍 **智能搜索** | 支持菜名、食材、制作方法搜索，中文输入法友好 |
| 🎯 **分类筛选** | 按菜系分类浏览，川菜、粤菜、家常菜等 |
| 🎥 **视频教程** | 为每道菜添加视频教程链接，支持B站、YouTube等 |
| 📱 **响应式设计** | 完美支持手机、平板、电脑访问 |
| 🚀 **快速部署** | 提供一键部署脚本，原生环境快速启动 |
| 💾 **数据安全** | SQLite本地存储，数据完全可控 |

## 🚀 快速开始

### 方式1：一键部署

```bash
# 1. 克隆项目
git clone https://github.com/axinhouzilaoyue/DishHub.git
cd DishHub

# 2. 一键部署
./scripts/deploy.sh

# 3. 访问应用
# 🌐 前端: http://localhost:4000
# 🔧 API: http://localhost:4001
```

### 方式2：本地开发

```bash
# 1. 安装依赖
# (如果根目录、client、server目录没有node_modules, dev.sh会自动安装)
npm install # 根目录
cd client && npm install && cd .. # 前端
cd server && npm install && cd .. # 后端

# 2. 启动开发环境
./scripts/dev.sh

# 3. 访问开发环境
# 🌐 前端: http://localhost:4000
# 🔧 API: http://localhost:4001
```

### 🎮 使用指南

| 操作 | 步骤 |
|------|------|
| **浏览菜品** | 首页 → 查看菜品卡片 → 使用搜索/筛选功能 |
| **查看详情** | 点击菜品卡片 → 查看食材和制作步骤 |
| **添加菜品** | 首页 → "添加菜品"按钮 → 填写表单 → 保存 |
| **编辑菜品** | 菜品详情页 → "编辑"按钮 → 修改信息 → 保存 |
| **添加教程** | 编辑菜品 → 填写"教程链接" → 详情页显示播放按钮 |

## 🛠 技术架构

### 技术栈
```
前端：React 18 + TypeScript + Tailwind CSS + Vite
后端：Node.js + Express + SQLite
```

### 项目结构
```
DishHub/
├── 📁 client/              # 前端应用
│   ├── src/components/     # React组件
│   ├── src/pages/         # 页面组件
│   └── src/services/      # API服务
├── 📁 server/              # 后端API
│   ├── database/          # 数据库配置
│   └── routes/            # API路由
├── 📁 scripts/             # 部署和开发脚本
└── 📋 README.md           # 项目说明
```

## 📡 API接口

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| `GET` | `/api/dishes` | 获取菜品列表 | `search`, `category`, `tag` |
| `GET` | `/api/dishes/:id` | 获取菜品详情 | `id` |
| `POST` | `/api/dishes` | 添加新菜品 | 菜品数据 |
| `PUT` | `/api/dishes/:id` | 更新菜品 | `id`, 菜品数据 |
| `DELETE` | `/api/dishes/:id` | 删除菜品 | `id` |
| `GET` | `/api/dishes/categories` | 获取分类列表 | - |
| `GET` | `/api/health` | 健康检查 | - |

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

---

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## ⭐ Star History

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
