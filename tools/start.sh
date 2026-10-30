#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo "Node 22.12+ required"; exit 1; }
command -v npm >/dev/null || exit 1
[[ -d node_modules ]] || { echo "Run npm ci first"; exit 1; }
[[ -f .env.local || -f .env ]] || { echo "Create .env.local from .env.example"; exit 1; }
# Vite refuses an occupied port; Ctrl+C stops only this foreground process.
exec npm run dev -- --port "${FRONTEND_PORT:-5173}" --strictPort
