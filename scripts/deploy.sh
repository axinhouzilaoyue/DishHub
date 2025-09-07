#!/bin/bash

# DishHub 传统部署脚本

echo "🚀 开始部署 DishHub..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js (推荐版本 18+)"
    echo "安装指南: https://nodejs.org/"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查端口占用
check_port() {
    local port=$1
    if lsof -ti:$port &> /dev/null; then
        echo "⚠️  端口 $port 被占用，请先停止占用该端口的进程"
        echo "查看占用进程: lsof -ti:$port"
        echo "停止进程: kill $(lsof -ti:$port)"
        return 1
    fi
    return 0
}

echo "🔍 检查端口占用..."
if ! check_port 4000; then
    read -p "是否继续部署？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if ! check_port 4001; then
    read -p "是否继续部署？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
echo "📦 安装项目依赖..."

echo "📦 安装根目录依赖..."
npm install

echo "📦 安装后端依赖..."
cd server && npm install && cd ..

echo "📦 安装前端依赖..."
cd client && npm install && cd ..

# 构建前端
echo "🏗️ 构建前端应用..."
cd client
npm run build
cd ..

echo "✅ 依赖安装完成"

# 创建启动脚本
echo "📝 创建启动脚本..."

cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 启动 DishHub 服务..."

# 启动后端
echo "📡 启动后端服务 (端口 4001)..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# 启动前端
echo "🌐 启动前端服务 (端口 4000)..."
cd client
npx serve -s dist -l 4000 &
FRONTEND_PID=$!
cd ..

echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:4000"
echo "  后端: http://localhost:4001"
echo ""
echo "📋 进程信息:"
echo "  后端进程 PID: $BACKEND_PID"
echo "  前端进程 PID: $FRONTEND_PID"
echo ""
echo "⏹️  停止服务请运行: ./stop.sh"

# 保存进程ID
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# 等待用户中断
wait
EOF

# 创建停止脚本
cat > stop.sh << 'EOF'
#!/bin/bash

echo "⏹️  停止 DishHub 服务..."

# 停止后端
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "📡 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm -f .backend.pid
fi

# 停止前端
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🌐 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm -f .frontend.pid
fi

# 停止所有相关进程
echo "🧹 清理相关进程..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "serve.*client" 2>/dev/null || true

echo "✅ 服务已停止"
EOF

# 添加执行权限
chmod +x start.sh stop.sh

echo ""
echo "🎉 部署完成！"
echo "================================================"
echo "📋 使用说明:"
echo "  启动服务: ./start.sh"
echo "  停止服务: ./stop.sh"
echo "  开发模式: npm run dev"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:4000"
echo "  后端: http://localhost:4001"
echo ""
echo "📁 项目文件:"
echo "  前端构建产物: client/dist/"
echo "  后端源码: server/"
echo "  数据库文件: server/data/dishes.db"
echo ""
echo "💡 生产环境建议:"
echo "  1. 使用 PM2 管理进程"
echo "  2. 配置 Nginx 反向代理"
echo "  3. 设置域名和 HTTPS"
echo "================================================"
