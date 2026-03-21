#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting website (localhost:4321) and presentation (localhost:3000)..."
(cd "$ROOT/website" && npm run dev -- --port 4321) &
(cd "$ROOT/presentation" && npm run dev -- --port 3000) &

echo "Both running. Ctrl+C to stop."
wait
