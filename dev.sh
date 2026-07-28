#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "停止服务..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "已停止"
}
trap cleanup EXIT INT TERM

echo "启动后端 (FastAPI) on :8000..."
cd "$ROOT/backend"
.venv/bin/uvicorn main:app --port 8000 &
BACKEND_PID=$!

sleep 1

echo "启动前端 (Vite) on :5173..."
cd "$ROOT/frontend"
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "  fastcurl 已启动"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "  按 Ctrl+C 停止"
echo ""

wait

