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
| 🚀 **快速部署** | 已适配 Cloudflare Pages 一键部署 |
| 💾 **数据安全** | Cloudflare D1 全球分布式数据库 |

## 🚀 快速开始

### 方式1：Cloudflare 部署 (推荐)

本项目已为 Cloudflare Pages 和 D1 数据库深度优化，可以实现一键部署、全球加速和极低的维护成本。

详细步骤请参考：[**Cloudflare 部署教程**](./DEPLOY_CLOUDFLARE.md)

### 方式2：本地开发

```bash
# 1. 克隆项目
git clone https://github.com/axinhouzilaoyue/DishHub.git
cd DishHub

# 2. 安装依赖
npm install
cd client && npm install && cd ..

# 3. 启动开发环境 (使用 Cloudflare Wrangler)
# (首次运行需要 npm install -g wrangler 和 wrangler login)
cd client
wrangler pages dev . --d1=DB
# 根据提示选择本地或远程 D1 数据库

# 4. 访问开发环境 (端口号以 Wrangler 启动时输出为准)
# 🌐 前端: http://localhost:8788 
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
后端：Cloudflare Pages Functions (Workers) + D1 数据库
```

### 项目结构
```
DishHub/
├── 📁 client/              # 前端应用和 API Functions
│   ├── src/               # React 源码
│   └── functions/         # Cloudflare Pages Functions (后端API)
│       └── api/
├── 📁 scripts/             # 开发和部署辅助脚本
└── 📋 README.md           # 项目说明
└── 📋 DEPLOY_CLOUDFLARE.md # Cloudflare 部署教程
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
