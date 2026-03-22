#!/usr/bin/env bash
# offline-install-tools.sh — PRESENTER TOOL — installs the pmtiles CLI
#
# This script is ONLY needed if you are presenting this talk offline
# and want the maps to work without an internet connection.
#
# If you are a student, contributor, or just exploring the code:
#   You do NOT need to run this. Skip it entirely.
#   The presentation works fine online without any extra setup.
#
# What this installs:
#   pmtiles CLI  — a standalone binary (~10 MB) for extracting regional
#                  map tile archives from the Protomaps planet build.
#                  It is NOT an npm package. Nothing is added to node_modules.
#
# After running this, download the map tiles with:
#   npm run offline:download-maps   (~130 MB, gitignored)
#
# Supports: macOS (arm64, x86_64), Linux (arm64, x86_64)
# Usage:    npm run offline:install-tools

set -euo pipefail

green() { printf '\033[32m%s\033[0m\n' "$*"; }
amber() { printf '\033[33m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$*"; }
dim()   { printf '\033[2m%s\033[0m\n'  "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

echo ""
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bold "  PRESENTER TOOL: Install offline map tile CLI (pmtiles)"
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  This installs the pmtiles CLI so you can download offline map"
echo "  tiles for the presentation slides."
echo ""
echo "  Only needed for presenters who want offline map support."
dim "  Students / contributors: press Ctrl+C to cancel — you don't need this."
echo ""

if command -v pmtiles &>/dev/null; then
  green "✓ pmtiles already installed: $(pmtiles --version 2>&1 | head -1)"
  echo ""
  echo "  Run 'npm run offline:download-maps' to download the map tiles."
  exit 0
fi

echo "  Proceeding in 5 seconds — press Ctrl+C to cancel."
for i in 5 4 3 2 1; do
  printf "\r  %d..." "$i"
  sleep 1
done
printf "\r             \n\n"

OS="$(uname -s)"
ARCH="$(uname -m)"

# Fetch latest release version from GitHub
echo "→ Looking up latest release..."
VERSION=$(curl -sf "https://api.github.com/repos/protomaps/go-pmtiles/releases/latest" \
  | grep '"tag_name"' | head -1 | sed 's/.*"v\([^"]*\)".*/\1/')

[[ -z "$VERSION" ]] && { red "Error: could not fetch latest version from GitHub."; exit 1; }
echo "→ Latest: v${VERSION}"

# ── macOS ──────────────────────────────────────────────────────────────────────
if [[ "$OS" == "Darwin" ]]; then
  if command -v brew &>/dev/null; then
    echo "→ Installing via Homebrew..."
    brew install pmtiles
    green "✓ $(pmtiles --version 2>&1 | head -1)"
    echo ""
    echo "  Next: npm run offline:download-maps"
    exit 0
  fi
  case "$ARCH" in
    arm64)  ASSET="go-pmtiles-${VERSION}_Darwin_arm64.zip"  ;;
    x86_64) ASSET="go-pmtiles-${VERSION}_Darwin_x86_64.zip" ;;
    *) red "Unsupported architecture: $ARCH"; exit 1 ;;
  esac
  EXT="zip"

# ── Linux ──────────────────────────────────────────────────────────────────────
elif [[ "$OS" == "Linux" ]]; then
  case "$ARCH" in
    x86_64|amd64)  ASSET="go-pmtiles_${VERSION}_Linux_x86_64.tar.gz" ;;
    arm64|aarch64) ASSET="go-pmtiles_${VERSION}_Linux_arm64.tar.gz"  ;;
    *) red "Unsupported architecture: $ARCH"; exit 1 ;;
  esac
  EXT="tar.gz"

else
  red "Unsupported OS: $OS (only macOS and Linux are supported)"
  echo "Manual install: https://github.com/protomaps/go-pmtiles/releases"
  exit 1
fi

# ── Download + extract ─────────────────────────────────────────────────────────
URL="https://github.com/protomaps/go-pmtiles/releases/download/v${VERSION}/${ASSET}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Downloading $ASSET ..."
curl -sSfL "$URL" -o "$TMP/archive"

if [[ "$EXT" == "zip" ]]; then
  unzip -q "$TMP/archive" -d "$TMP"
else
  tar -xzf "$TMP/archive" -C "$TMP"
fi

chmod +x "$TMP/pmtiles"

# ── Install to PATH ────────────────────────────────────────────────────────────
INSTALL_DIR=""
for dir in /usr/local/bin "$HOME/.local/bin" "$HOME/bin"; do
  if [[ -d "$dir" ]] && [[ -w "$dir" ]]; then
    INSTALL_DIR="$dir"
    break
  fi
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -n "$INSTALL_DIR" ]]; then
  mv "$TMP/pmtiles" "$INSTALL_DIR/pmtiles"
  green "✓ pmtiles v${VERSION} installed → $INSTALL_DIR/pmtiles"
else
  mkdir -p "$SCRIPT_DIR/bin"
  mv "$TMP/pmtiles" "$SCRIPT_DIR/bin/pmtiles"
  amber "⚠ No writable PATH dir found — installed to scripts/bin/pmtiles"
  echo "  Add to your shell profile:"
  echo "    export PATH=\"\$PATH:$SCRIPT_DIR/bin\""
fi

echo ""
echo "  Next: npm run offline:download-maps"
