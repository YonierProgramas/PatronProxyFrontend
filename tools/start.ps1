$ErrorActionPreference = 'Stop'
Set-Location "$PSScriptRoot/.."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Se requiere Node 22.12+.' }
if (-not (Test-Path node_modules)) { throw 'Ejecuta npm ci primero.' }
if (-not ((Test-Path .env.local) -or (Test-Path .env))) { throw 'Crea .env.local desde .env.example.' }
$port = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { '5173' }
npm run dev -- --port $port --strictPort
