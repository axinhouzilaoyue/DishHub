#!/bin/bash

# 网络访问问题排查脚本

echo "🔍 DishHub 网络访问问题排查"
echo "=================================="

# 1. 检查容器状态
echo ""
echo "1️⃣ 检查容器运行状态:"
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose 未找到"
    exit 1
fi

echo "使用命令: $COMPOSE_CMD"
$COMPOSE_CMD ps

# 2. 检查端口监听
echo ""
echo "2️⃣ 检查端口监听状态:"
echo "检查 4000 端口:"
if netstat -tlnp 2>/dev/null | grep :4000; then
    echo "✅ 端口 4000 正在监听"
else
    echo "❌ 端口 4000 未监听"
fi

echo "检查 4001 端口:"
if netstat -tlnp 2>/dev/null | grep :4001; then
    echo "✅ 端口 4001 正在监听"
else
    echo "❌ 端口 4001 未监听"
fi

# 3. 检查 Docker 网络
echo ""
echo "3️⃣ 检查 Docker 网络:"
docker network ls
echo ""
echo "检查容器网络连接:"
$COMPOSE_CMD exec backend ping -c 2 frontend 2>/dev/null || echo "❌ 后端无法连接前端"

# 4. 测试本地访问
echo ""
echo "4️⃣ 测试本地访问:"
echo "测试后端健康检查:"
if curl -s http://localhost:4001/api/health > /dev/null; then
    echo "✅ 后端本地访问正常"
    curl -s http://localhost:4001/api/health | head -1
else
    echo "❌ 后端本地访问失败"
fi

echo "测试前端访问:"
if curl -s -I http://localhost:4000 | grep "HTTP" > /dev/null; then
    echo "✅ 前端本地访问正常"
else
    echo "❌ 前端本地访问失败"
fi

# 5. 检查防火墙
echo ""
echo "5️⃣ 检查防火墙状态:"
if command -v ufw &> /dev/null; then
    echo "UFW 防火墙状态:"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "FirewallD 状态:"
    sudo firewall-cmd --list-ports
else
    echo "未检测到常见防火墙工具"
fi

# 6. 检查进程
echo ""
echo "6️⃣ 检查相关进程:"
ps aux | grep -E "(node|nginx)" | grep -v grep

# 7. 检查容器日志
echo ""
echo "7️⃣ 查看容器日志 (最近50行):"
echo "--- 前端日志 ---"
$COMPOSE_CMD logs --tail=10 frontend
echo ""
echo "--- 后端日志 ---"
$COMPOSE_CMD logs --tail=10 backend

echo ""
echo "🔧 常见解决方案:"
echo "1. 重启容器: $COMPOSE_CMD restart"
echo "2. 重新构建: $COMPOSE_CMD up -d --build"
echo "3. 开放防火墙: sudo ufw allow 4000 && sudo ufw allow 4001"
echo "4. 检查云服务器安全组是否开放 4000/4001 端口"
