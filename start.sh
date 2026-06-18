#!/bin/bash
# ============================================
# Camil&Tieria · 雅思农场助手 — macOS 启动脚本
# 适用于 Intel / Apple Silicon Mac
# ============================================

cd "$(dirname "$0")"

echo "🌱 正在启动雅思农场助手..."

# 检查 Node.js
if ! command -v node &>/dev/null; then
  echo "❌ 未找到 Node.js，请先安装：https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# 检查端口是否被占用
PORT=${PORT:-4173}
if lsof -i :$PORT &>/dev/null; then
  echo "⚠️  端口 $PORT 已被占用，正在释放..."
  lsof -ti :$PORT | xargs kill -9 2>/dev/null
  sleep 1
fi

echo "🚀 启动服务器：http://127.0.0.1:$PORT"
node server.js
