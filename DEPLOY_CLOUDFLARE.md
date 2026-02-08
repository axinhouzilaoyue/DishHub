# DishHub Cloudflare 部署手册

本文档给出 DishHub 在 Cloudflare 上的标准部署流程。

## 1. 前置条件

- 已创建 Cloudflare 账号
- 已安装 Node.js 18+
- 已安装并登录 Wrangler

```bash
npm i -g wrangler
wrangler login
```

## 2. 创建 Pages 项目（若尚未创建）

```bash
wrangler pages project create dishhub --production-branch main
```

## 3. 绑定 D1 数据库

在 Cloudflare Dashboard 中，为 Pages 项目添加 D1 绑定：
- 变量名：`DB`
- 数据库：`dishhub-db`

或确保 `client/wrangler.toml` 中 `[[d1_databases]]` 配置正确。

## 4. 备份现网数据（强烈建议）

```bash
./scripts/backup-d1.sh
```

## 5. 部署

```bash
PROJECT_NAME=dishhub BRANCH_NAME=main ./scripts/deploy.sh
```

## 6. 验收

```bash
BASE_URL=https://<your-pages-domain> ./scripts/smoke-cf.sh
```

## 7. 常见问题

### 7.1 D1 绑定不存在
- 现象：API 返回 `DB_BINDING_MISSING`
- 检查：Pages 项目中的 D1 绑定变量名必须是 `DB`

### 7.2 迁移执行失败
- 命令：`cd client && wrangler d1 migrations list DB`
- 检查迁移 SQL 是否包含不兼容语法后重试

### 7.3 部署成功但 API 404
- 确认 `client/functions/api/` 文件是否存在
- 确认部署目录为 `client/dist` 并包含 Functions

### 7.4 网页一键备份提示鉴权失败
- 现象：`/api/admin/backup` 返回 401
- 原因：已配置 `BACKUP_KEY`，但网页未填写或填写错误
- 处理：
  1. 在 Pages 项目环境变量确认 `BACKUP_KEY` 当前值
  2. 在 DishHub `/settings` 页输入相同口令后再导出
