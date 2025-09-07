# 🚀 DishHub 容器化部署指南

## 📋 部署前检查清单

### ✅ 环境要求
- [ ] Docker >= 20.10
- [ ] Docker Compose >= 2.0 或 docker-compose >= 1.27

### ✅ 端口配置检查
- [ ] 前端端口：4000 (外部) → 80 (容器内)
- [ ] 后端端口：4001 (外部) → 4001 (容器内)
- [ ] nginx 代理：`backend:4001`
- [ ] 防火墙开放：4000, 4001

## 🚀 快速部署

### 方法1：一键部署脚本
```bash
git pull
./scripts/deploy.sh
```

### 方法2：手动部署
```bash
# 停止现有容器
docker compose down

# 构建并启动
docker compose up -d --build

# 查看状态
docker compose ps
docker compose logs -f
```

## 🔍 部署验证

### 1. 容器状态检查
```bash
# 查看容器状态
docker compose ps

# 预期输出：
# NAME               IMAGE     COMMAND                  SERVICE    STATUS    PORTS
# dishhub-backend    ...       "npm start"             backend    Up        0.0.0.0:4001->4001/tcp
# dishhub-frontend   ...       "nginx -g 'daemon of…"  frontend   Up        0.0.0.0:4000->80/tcp
```

### 2. 网络连接检查
```bash
# 检查端口监听
netstat -tlnp | grep -E '4000|4001'

# 预期输出：
# tcp6  0  0  :::4000  :::*  LISTEN  <pid>/docker-proxy
# tcp6  0  0  :::4001  :::*  LISTEN  <pid>/docker-proxy
```

### 3. 服务功能检查
```bash
# 测试后端API
curl http://localhost:4001/api/health

# 预期输出：
# {"status":"OK","message":"DishHub API 运行正常"}

# 测试前端
curl -I http://localhost:4000

# 预期输出：
# HTTP/1.1 200 OK
```

### 4. 数据库检查
```bash
# 查看数据库日志
docker compose logs backend | grep -E "(数据库|SQLite)"

# 预期输出包含：
# ✅ 已连接到SQLite数据库
# ✅ 数据库表初始化完成
```

## 🔧 常见问题排查

### 问题1：端口冲突
```bash
# 检查端口占用
sudo lsof -i :4000
sudo lsof -i :4001

# 解决方案：停止占用端口的服务或修改端口配置
```

### 问题2：容器启动失败
```bash
# 查看详细错误日志
docker compose logs backend
docker compose logs frontend

# 重新构建镜像
docker compose build --no-cache
docker compose up -d
```

### 问题3：API代理失败
```bash
# 检查网络连接
docker compose exec frontend ping backend

# 检查nginx配置
docker compose exec frontend cat /etc/nginx/nginx.conf | grep backend
```

### 问题4：权限问题
```bash
# 确保数据目录权限正确
sudo chown -R $USER:$USER server/data
chmod 755 server/data
```

## 📊 性能监控

### 资源使用查看
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

### 日志管理
```bash
# 实时查看日志
docker compose logs -f

# 查看最近的日志
docker compose logs --tail=50

# 查看特定服务日志
docker compose logs backend
docker compose logs frontend
```

## 🛠 维护操作

### 更新应用
```bash
git pull
docker compose up -d --build
```

### 数据备份
```bash
# 备份数据库
docker cp dishhub-backend-1:/app/data/dishes.db ./backup_$(date +%Y%m%d).db

# 恢复数据库
docker cp ./backup_YYYYMMDD.db dishhub-backend-1:/app/data/dishes.db
docker compose restart backend
```

### 清理资源
```bash
# 清理未使用的镜像
docker image prune

# 清理所有资源（谨慎使用）
docker system prune -a
```

## 🌐 外网访问配置

### 防火墙设置
```bash
# Ubuntu/Debian
sudo ufw allow 4000
sudo ufw allow 4001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --permanent --add-port=4001/tcp
sudo firewall-cmd --reload
```

### 云服务器安全组
确保云服务器安全组开放以下端口：
- 入站规则：TCP 4000 (0.0.0.0/0)
- 入站规则：TCP 4001 (0.0.0.0/0)

## 📞 技术支持

如果遇到部署问题，请提供以下信息：
1. 操作系统版本
2. Docker 版本 (`docker --version`)
3. 错误日志 (`docker compose logs`)
4. 容器状态 (`docker compose ps`)

访问地址：
- 🌐 前端：http://你的服务器IP:4000
- 🔧 后端API：http://你的服务器IP:4001/api/health
