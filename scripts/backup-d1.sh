#!/bin/bash

set -euo pipefail

DB_NAME="${DB_NAME:-dishhub-db}"
BACKUP_ROOT="${BACKUP_ROOT:-backups}"
TS=$(date +%F-%H%M%S)
OUT_DIR="${BACKUP_ROOT}/${TS}"

mkdir -p "${OUT_DIR}"

echo "📦 导出 D1 远程数据库: ${DB_NAME}"
wrangler d1 export "${DB_NAME}" --remote --output "${OUT_DIR}/${DB_NAME}-full.sql"
wrangler d1 export "${DB_NAME}" --remote --no-data --output "${OUT_DIR}/${DB_NAME}-schema.sql"
wrangler d1 export "${DB_NAME}" --remote --no-schema --output "${OUT_DIR}/${DB_NAME}-data.sql"

shasum -a 256 "${OUT_DIR}"/*.sql > "${OUT_DIR}/SHA256SUMS.txt"

echo "✅ 备份完成: ${OUT_DIR}"
ls -lh "${OUT_DIR}"
