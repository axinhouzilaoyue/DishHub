#!/bin/bash

# DishHub 开发环境启动脚本

echo "🚀 启动 DishHub 开发环境..."

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装根目录依赖..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

echo "✅ 依赖检查完成"

# 启动开发服务器
echo "🔥 启动开发服务器..."
npm run dev