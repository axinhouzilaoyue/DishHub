#!/bin/bash

set -euo pipefail

echo "🚀 启动 DishHub Cloudflare 本地开发..."

if [ ! -d "client/node_modules" ]; then
  echo "📦 安装前端依赖..."
  cd client
  npm install
  cd ..
fi

echo "🔧 启动 wrangler pages dev (绑定 D1: DB)..."
cd client
npm run dev

