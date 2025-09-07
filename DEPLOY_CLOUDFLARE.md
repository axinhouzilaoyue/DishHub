# 🍽️ DishHub - Cloudflare Pages 部署教程

本文档将指导你如何将 DishHub 应用部署到 Cloudflare Pages 和 D1 数据库。

## 部署概述

我们将使用 Cloudflare 的全套无服务器方案：
- **Cloudflare Pages**: 用于托管和部署前端静态资源（React 应用）。
- **Pages Functions**: 用于提供后端 API 服务（本质是 Cloudflare Workers）。
- **Cloudflare D1**: 用于提供无服务器 SQL 数据库。

## 部署步骤

### 1. 准备工作

- 一个 [Cloudflare](https://dash.cloudflare.com/sign-up) 账户。
- 一个 [GitHub](https://github.com/) 账户，并将本项目 Fork 到你自己的仓库中。
- 安装了 [Node.js](https://nodejs.org/) (v18+)。

### 2. 创建 D1 数据库

1.  登录 Cloudflare 控制台。
2.  在左侧导航栏中，进入 **Workers 和 Pages** -> **D1**。
3.  点击 **创建数据库**。
4.  填写数据库名称（例如 `dishhub-db`），选择一个就近的区域，然后点击 **创建**。

### 3. 创建数据表 (Schema)

1.  数据库创建成功后，进入该数据库的详情页。
2.  切换到 **控制台 (Console)** 标签页。
3.  将下面的 SQL 语句粘贴到输入框中，然后点击 **执行**，以创建 `dishes` 表：

```sql
CREATE TABLE dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT '家常菜',
    difficulty INTEGER DEFAULT 1,
    cooking_time INTEGER DEFAULT 30,
    servings INTEGER DEFAULT 2,
    ingredients TEXT DEFAULT '[]',
    instructions TEXT DEFAULT '[]',
    image TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    tutorial_url TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. （可选）导入初始数据

如果你想导入一些示例数据，可以执行下面的 `INSERT` 语句：

```sql
INSERT INTO dishes (name, category, difficulty, cooking_time, servings, ingredients, instructions, tags, image, tutorial_url) VALUES
('红烧肉', '家常菜', 3, 90, 4, '["五花肉", "葱", "姜", "蒜", "冰糖", "老抽", "生抽"]', '["1. 五花肉切块焯水...", "2. 炒糖色...", "3. 加入调料慢炖..."]', '["本帮菜", "下饭菜"]', 'https://example.com/hongshaorou.jpg', ''),
('番茄炒蛋', '家常菜', 1, 15, 2, '["番茄", "鸡蛋", "葱", "盐", "糖"]', '["1. 鸡蛋打散...", "2. 番茄切块...", "3. 先炒鸡蛋，再炒番茄..."]', '["快手菜", "国民菜"]', 'https://example.com/fanqiechaodan.jpg', '');
```

### 5. 创建 Cloudflare Pages 项目

1.  在 Cloudflare 控制台，进入 **Workers 和 Pages** -> **概述**。
2.  点击 **创建应用程序** -> **Pages** -> **连接到 Git**。
3.  选择你 Fork 的 DishHub 仓库，然后点击 **开始设置**。

### 6. 配置构建和部署

在设置页面，填写以下信息：

-   **项目名称**: `dishhub` (或任何你喜欢的名称)
-   **生产分支**: `feature/cloudflare-deploy` (或者你合并代码后的 `main` 分支)

#### **构建设置**:

-   **框架预设**: 选择 `Vite`。
-   **构建命令**: `npm run build`
-   **构建输出目录**: `dist`
-   **根目录**: `client`

#### **环境变量**:
这一步是可选的，如果你想在本地开发时连接 D1 数据库，可以设置。生产环境将通过下面的绑定自动注入。

#### **函数和存储绑定**:

1.  展开 **函数和存储绑定** 部分。
2.  点击 **添加绑定** -> **D1 数据库**。
3.  **变量名称**: `DB` (这个名称必须和代码 `env.DB` 中的 `DB` 完全一致)。
4.  **D1 数据库**: 选择你刚才创建的 `dishhub-db`。
5.  点击 **保存**。

### 7. 部署

完成所有配置后，点击 **保存并部署**。

Cloudflare Pages 会自动从 GitHub 拉取代码，执行构建命令，并将你的应用和 API 函数部署到全球网络。

部署完成后，你将获得一个 `*.pages.dev` 的访问地址。恭喜你，部署成功！

## 本地开发 (使用 Wrangler)

如果你想在本地模拟 Cloudflare 环境进行开发和调试：

1.  **安装 Wrangler**:
    ```bash
    npm install -g wrangler
    ```

2.  **登录 Wrangler**:
    ```bash
    wrangler login
    ```

3.  **在 `client` 目录下运行开发服务器**:
    ```bash
    cd client
    wrangler pages dev . --d1=DB
    ```
    - `.` 指的是当前目录作为静态资源目录。
    - `--d1=DB` 会让你选择要绑定的本地或远程 D1 数据库，用于本地开发。

现在你可以在本地访问应用，并且 API 会连接到你指定的 D1 数据库，获得和线上一致的开发体验。
