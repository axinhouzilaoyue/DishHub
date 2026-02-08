#!/bin/bash

set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-dishhub}"
BRANCH_NAME="${BRANCH_NAME:-main}"

echo "🚀 开始部署 DishHub 到 Cloudflare Pages..."

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ 未检测到 npm，请先安装 Node.js 18+"
  exit 1
fi

if ! command -v wrangler >/dev/null 2>&1; then
  echo "❌ 未检测到 wrangler，请先执行: npm i -g wrangler"
  exit 1
fi

echo "🔐 检查 Wrangler 登录状态..."
wrangler whoami >/dev/null

echo "📦 安装根目录依赖..."
npm install

echo "📦 安装前端依赖..."
cd client
npm install

echo "🏗️ 构建前端..."
npm run build

echo "🧱 应用 D1 迁移（remote）..."
wrangler d1 migrations apply DB --remote

echo "🌐 部署到 Pages 项目: ${PROJECT_NAME} (branch=${BRANCH_NAME})"
wrangler pages deploy dist --project-name "${PROJECT_NAME}" --branch "${BRANCH_NAME}"

cd ..

echo "✅ 部署完成。建议执行: ./scripts/smoke-cf.sh"

