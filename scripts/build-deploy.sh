#!/usr/bin/env bash
set -euo pipefail

# Build the full site locally: website at root, presentation at /slides/
# Output goes to _site/

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building website..."
(cd "$ROOT/website" && npm ci && npm run build)

echo "Building presentation (base=/slides/)..."
(cd "$ROOT/presentation" && npm ci && npm run build -- --base /slides/)

echo "Assembling..."
rm -rf "$ROOT/_site"
mkdir -p "$ROOT/_site/slides"
cp -r "$ROOT/website/dist/"* "$ROOT/_site/"
cp -r "$ROOT/presentation/dist/"* "$ROOT/_site/slides/"

echo ""
echo "Done. Preview with:"
echo "  npx serve _site"
echo ""
echo "To deploy via GitHub Actions:"
echo "  1. Push your changes"
echo "  2. Go to: https://github.com/lerenzo-enpal/kubecon-2026-vpp/actions/workflows/deploy.yml"
echo "  3. Click 'Run workflow'"
