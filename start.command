#!/bin/bash
# Camil&Tieria · 雅思农场助手 — Mac 双击启动
cd "$(dirname "$0")"

echo "🌱 雅思农场助手启动中..."
echo ""

# 检查 Node.js
if ! command -v node &>/dev/null; then
  echo "❌ 未安装 Node.js"
  echo "   请访问 https://nodejs.org 下载安装后再试"
  echo ""
  read -p "按回车键退出..."
  exit 1
fi

# 端口释放
if lsof -i :4173 &>/dev/null; then
  lsof -ti :4173 | xargs kill -9 2>/dev/null
  sleep 1
fi

# 启动服务器
node server.js &
sleep 2

# 自动打开浏览器
open "http://127.0.0.1:4173"

echo ""
echo "✅ 已在浏览器中打开 http://127.0.0.1:4173"
echo "   关闭此窗口不会停止服务器"
echo ""
read -p "按回车键退出（不影响使用）..."
