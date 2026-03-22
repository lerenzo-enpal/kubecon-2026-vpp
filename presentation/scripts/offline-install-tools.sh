#!/usr/bin/env bash
# install-deps.sh — Install tools required by presentation scripts
#
# Installs:
#   pmtiles  — CLI for extracting offline map tile archives (npm run download:assets)
#
# Supports: macOS (arm64, x86_64), Linux (arm64, x86_64)
# Usage:    npm run install:deps

set -euo pipefail

green() { printf '\033[32m%s\033[0m\n' "$*"; }
amber() { printf '\033[33m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

bold "── pmtiles CLI ───────────────────────────────────────────────────────────"

if command -v pmtiles &>/dev/null; then
  green "✓ Already installed: $(pmtiles --version 2>&1 | head -1)"
  exit 0
fi

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
  green "✓ pmtiles v${VERSION} → $INSTALL_DIR/pmtiles"
else
  mkdir -p "$SCRIPT_DIR/bin"
  mv "$TMP/pmtiles" "$SCRIPT_DIR/bin/pmtiles"
  amber "⚠ No writable PATH dir found — installed to scripts/bin/pmtiles"
  echo "  Add to your shell profile:"
  echo "    export PATH=\"\$PATH:$SCRIPT_DIR/bin\""
fi
