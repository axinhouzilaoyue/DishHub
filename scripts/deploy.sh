#!/bin/bash

# 生产环境部署脚本

echo "🚀 部署 DishHub 到生产环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动新容器
echo "🔨 构建并启动容器..."
docker-compose up -d --build

# 检查容器状态
echo "✅ 检查容器状态..."
docker-compose ps

echo ""
echo "🎉 部署完成！"
echo "📱 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:3001"
echo ""
echo "💡 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
