#!/bin/bash

# 生产环境部署脚本

echo "🚀 部署 DishHub 到生产环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查Docker Compose (支持新旧版本)
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo "✅ 使用 docker-compose 命令"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    echo "✅ 使用 docker compose 插件"
else
    echo "❌ Docker Compose 未安装或配置不正确"
    echo "请安装 Docker Compose:"
    echo "  Ubuntu/Debian: sudo apt install docker-compose-plugin"
    echo "  或手动下载: https://docs.docker.com/compose/install/"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
$COMPOSE_CMD down

# 构建并启动新容器
echo "🔨 构建并启动容器..."
$COMPOSE_CMD up -d --build

# 检查容器状态
echo "✅ 检查容器状态..."
$COMPOSE_CMD ps

echo ""
echo "🎉 部署完成！"
echo "📱 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:3001"
echo ""
echo "💡 常用命令:"
echo "  查看日志: $COMPOSE_CMD logs -f"
echo "  停止服务: $COMPOSE_CMD down"
echo "  重启服务: $COMPOSE_CMD restart"
