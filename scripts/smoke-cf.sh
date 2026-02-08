#!/bin/bash

set -euo pipefail

BASE_URL="${BASE_URL:-}"

if [ -z "${BASE_URL}" ]; then
  echo "❌ 请先设置 BASE_URL，例如:"
  echo "   BASE_URL=https://dishhub.pages.dev ./scripts/smoke-cf.sh"
  exit 1
fi

echo "🩺 Smoke 检查: ${BASE_URL}"

health_status=$(curl -sS -o /tmp/dishhub_health.json -w "%{http_code}" "${BASE_URL}/api/health")
if [ "${health_status}" != "200" ]; then
  echo "❌ /api/health 返回 ${health_status}"
  cat /tmp/dishhub_health.json || true
  exit 1
fi

dishes_status=$(curl -sS -o /tmp/dishhub_dishes.json -w "%{http_code}" "${BASE_URL}/api/dishes")
if [ "${dishes_status}" != "200" ]; then
  echo "❌ /api/dishes 返回 ${dishes_status}"
  cat /tmp/dishhub_dishes.json || true
  exit 1
fi

echo "✅ /api/health 正常"
echo "✅ /api/dishes 正常"
echo "🎉 Smoke 检查通过"
