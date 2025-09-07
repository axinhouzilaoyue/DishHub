#!/bin/bash

# Docker 和 Docker Compose 安装检查脚本

echo "🔍 检查 Docker 和 Docker Compose 安装状态..."
echo "=============================================="

# 检查 Docker 是否安装
echo "1️⃣ 检查 Docker 安装..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker 已安装: $DOCKER_VERSION"
else
    echo "❌ Docker 未安装"
    echo "   安装命令: sudo apt update && sudo apt install docker.io"
    exit 1
fi

# 检查 Docker 服务状态
echo ""
echo "2️⃣ 检查 Docker 服务状态..."
if sudo systemctl is-active --quiet docker; then
    echo "✅ Docker 服务正在运行"
else
    echo "⚠️  Docker 服务未运行"
    echo "   启动命令: sudo systemctl start docker"
    echo "   开机自启: sudo systemctl enable docker"
fi

# 检查当前用户权限
echo ""
echo "3️⃣ 检查用户权限..."
if groups $USER | grep -q docker; then
    echo "✅ 当前用户($USER)已在 docker 组"
else
    echo "⚠️  当前用户($USER)不在 docker 组"
    echo "   添加到组: sudo usermod -aG docker $USER"
    echo "   重新登录后生效"
fi

# 测试 Docker 权限
echo ""
echo "4️⃣ 测试 Docker 权限..."
if docker ps &> /dev/null; then
    echo "✅ Docker 权限正常"
else
    echo "⚠️  Docker 权限不足，可能需要 sudo 或重新登录"
fi

# 检查 Docker Compose (旧版本)
echo ""
echo "5️⃣ 检查 Docker Compose (旧版本)..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_V1=$(docker-compose --version)
    echo "✅ docker-compose 已安装: $COMPOSE_V1"
    COMPOSE_AVAILABLE=true
else
    echo "❌ docker-compose 未安装"
fi

# 检查 Docker Compose (新版本插件)
echo ""
echo "6️⃣ 检查 Docker Compose (新版本插件)..."
if docker compose version &> /dev/null; then
    COMPOSE_V2=$(docker compose version)
    echo "✅ docker compose 插件已安装: $COMPOSE_V2"
    COMPOSE_AVAILABLE=true
else
    echo "❌ docker compose 插件未安装"
fi

# 总结
echo ""
echo "📋 安装总结:"
echo "=============================================="

if [[ "$COMPOSE_AVAILABLE" == "true" ]]; then
    echo "🎉 恭喜！Docker 和 Docker Compose 已准备就绪"
    echo ""
    echo "🚀 现在可以部署 DishHub:"
    echo "   git clone https://github.com/axinhouzilaoyue/DishHub.git"
    echo "   cd DishHub"
    echo "   ./scripts/deploy-v2.sh"
else
    echo "⚠️  需要安装 Docker Compose"
    echo ""
    echo "🔧 安装 Docker Compose (选择一种方法):"
    echo ""
    echo "方法1 - 安装插件版本 (推荐):"
    echo "   sudo apt update"
    echo "   sudo apt install docker-compose-plugin"
    echo ""
    echo "方法2 - 安装独立版本:"
    echo "   sudo apt install docker-compose"
    echo ""
    echo "方法3 - 手动下载:"
    echo "   sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "   sudo chmod +x /usr/local/bin/docker-compose"
fi

echo ""
echo "✅ 检查完成！"
