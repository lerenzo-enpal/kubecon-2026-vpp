#!/usr/bin/env bash
# offline-download-maps.sh — PRESENTER TOOL — download offline map tiles
#
# This script is ONLY needed if you are presenting this talk offline
# and want the maps to work without an internet connection.
#
# If you are a student, contributor, or just exploring the code:
#   You do NOT need to run this. Skip it entirely.
#   The presentation works fine online without any extra setup.
#
# What this downloads (~130 MB total, into presentation/public/tiles/ which
# is gitignored — you need to run this on each machine you present from):
#   Regional PMTiles archives  — offline vector map tiles for Europe, Berlin,
#                                Adelaide, Texas, and Wolfsburg
#   CARTO dark-matter styles   — style JSON, sprites, and font glyphs
#
# Prerequisites:
#   pmtiles CLI — run 'npm run offline:install-tools' first
#
# Usage:
#   npm run offline:download-maps              # auto-detect latest build
#   npm run offline:download-maps -- --force   # re-download everything
#   PROTOMAPS_DATE=20260315 npm run offline:download-maps

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$SCRIPT_DIR/../public/tiles"
FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

# ── Colour helpers ─────────────────────────────────────────────────────────────
green() { printf '\033[32m%s\033[0m\n' "$*"; }
amber() { printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$*"; }
dim()   { printf '\033[2m%s\033[0m\n'  "$*"; }

# ── Preamble ───────────────────────────────────────────────────────────────────
echo ""
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bold "  PRESENTER TOOL: Download offline map tiles (~130 MB)"
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Downloads regional map tiles so the presentation slides work"
echo "  without an internet connection during the talk."
echo ""
echo "  Files go to presentation/public/tiles/ (gitignored)."
echo "  Re-run at any time to refresh to the latest build."
echo ""
dim "  Students / contributors: press Ctrl+C to cancel — you don't need this."
echo ""

if [[ "$FORCE" == false ]]; then
  echo "  Proceeding in 5 seconds — press Ctrl+C to cancel."
  for i in 5 4 3 2 1; do
    printf "\r  %d..." "$i"
    sleep 1
  done
  printf "\r             \n\n"
fi

# ── Check pmtiles CLI ──────────────────────────────────────────────────────────
if ! command -v pmtiles &>/dev/null; then
  red "Error: pmtiles CLI not found."
  echo ""
  echo "  Run this first:  npm run offline:install-tools"
  exit 1
fi

bold "→ pmtiles $(pmtiles --version 2>&1 | head -1)"

# ── Find latest Protomaps build ────────────────────────────────────────────────
# Protomaps publishes daily planet builds. We try today and up to 5 days back.
if [[ -n "${PROTOMAPS_DATE:-}" ]]; then
  SOURCE="https://build.protomaps.com/${PROTOMAPS_DATE}.pmtiles"
  bold "→ Using specified build: $SOURCE"
else
  SOURCE=""
  echo "→ Looking for latest Protomaps build..."
  for i in 0 1 2 3 4 5; do
    # Cross-platform date arithmetic
    if date --version &>/dev/null 2>&1; then
      d=$(date -d "-${i} days" +%Y%m%d 2>/dev/null)  # GNU (Linux)
    else
      d=$(date -v"-${i}d" +%Y%m%d 2>/dev/null)        # BSD (macOS)
    fi
    URL="https://build.protomaps.com/${d}.pmtiles"
    if curl --head --silent --fail --max-time 10 "$URL" &>/dev/null; then
      SOURCE="$URL"
      green "✓ Found build: $URL"
      break
    fi
  done
  if [[ -z "$SOURCE" ]]; then
    red "Error: Could not find a recent Protomaps build."
    echo "Set PROTOMAPS_DATE=YYYYMMDD and try again."
    exit 1
  fi
fi

# ── Create output dirs ─────────────────────────────────────────────────────────
mkdir -p "$OUT/styles" "$OUT/sprites" "$OUT/fonts"

# ── Extract tile regions ───────────────────────────────────────────────────────
#
# Each extract covers the specific zoom levels and geographic bbox used in the
# corresponding presentation component. Keeps file sizes manageable.
#
# Format: extract <name> <west,south,east,north> <maxzoom>

extract() {
  local name="$1" bbox="$2" maxzoom="$3"
  local out_file="$OUT/${name}.pmtiles"

  if [[ -f "$out_file" ]] && [[ "$FORCE" == false ]]; then
    amber "⊘ $name.pmtiles already exists (use --force to re-download)"
    return
  fi

  echo "→ Extracting $name.pmtiles  bbox: $bbox  z0-$maxzoom ..."
  pmtiles extract "$SOURCE" "$out_file" \
    --bbox="$bbox" \
    --maxzoom="$maxzoom" \
    --download-threads=4
  green "✓ $name.pmtiles  ($(du -sh "$out_file" | cut -f1))"
}

echo ""
bold "── Tile regions ──────────────────────────────────────────────────────────"

# EUGridHUD (z3.4–11.5) + LargestMachineZoom flyout (z3.8–12)
extract "europe"    "-12,34,40,72"              12

# LargestMachineZoom: starts at Wolfsburg at zoom 14
extract "wolfsburg" "10.58,52.30,10.98,52.55"   14

# VPPScenarioMapSlide: zooms to Riemerstraße 5, Reinickendorf (z17)
# Wider bbox to cover full Berlin metro area without cutoff
extract "berlin"    "12.90,52.30,13.80,52.75"   17

# SAMapHUD: Adelaide area, zoom up to 11.5
extract "adelaide"  "135.4,-36.1,139.6,-32.4"   12

# TexasMapHUD: ERCOT region, zoom up to 7.5
extract "texas"     "-107,25,-93,37"             9

# ── CARTO dark-matter style JSONs (kept as offline probe marker) ──────────────
echo ""
bold "── Style assets ──────────────────────────────────────────────────────────"

download_if_missing() {
  local url="$1" dest="$2"
  if [[ -f "$dest" ]] && [[ "$FORCE" == false ]]; then
    amber "⊘ $(basename "$dest") already exists"
    return
  fi
  echo "→ Downloading $(basename "$dest") ..."
  curl -sSf --max-time 30 "$url" -o "$dest"
  green "✓ $(basename "$dest")"
}

# dark-matter.json is used as the offline probe marker (HEAD request) to detect
# whether local tiles are present. The actual offline map style is generated at
# runtime by @protomaps/basemaps using the Protomaps schema layer names.
download_if_missing \
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" \
  "$OUT/styles/dark-matter.json"

download_if_missing \
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json" \
  "$OUT/styles/dark-matter-nolabels.json"

# ── Protomaps sprites (used by the offline @protomaps/basemaps dark style) ────
# The CARTO sprites and Protomaps sprites are different icon sets.
# Protomaps sprites go to sprites-pm/ to avoid collision with CARTO sprites.
mkdir -p "$OUT/sprites-pm"
PM_SPRITE_BASE="https://protomaps.github.io/basemaps-assets/sprites/v4"
for ext in png json; do
  download_if_missing "$PM_SPRITE_BASE/dark.${ext}"    "$OUT/sprites-pm/dark.${ext}"
  download_if_missing "$PM_SPRITE_BASE/dark@2x.${ext}" "$OUT/sprites-pm/dark@2x.${ext}"
done

# ── Font glyphs ────────────────────────────────────────────────────────────────
# MapLibre fetches glyphs as {fontstack}/{start}-{end}.pbf (256-char ranges).
# All fonts go to the same tiles/fonts/ directory regardless of CDN source.
# Protomaps dark style uses: Noto Sans Regular, Noto Sans Italic, Noto Sans Medium
# CARTO dark-matter style uses: Open Sans, Montserrat, Noto Sans, and others
echo ""
bold "── Font glyphs (Latin ranges) ────────────────────────────────────────────"

download_font_range() {
  local base_url="$1" font="$2"
  local font_dir="$OUT/fonts/$font"
  mkdir -p "$font_dir"
  local any_downloaded=false
  for start in $(seq 0 256 3839); do
    local end=$((start + 255))
    local range="${start}-${end}"
    local out_pbf="$font_dir/${range}.pbf"
    if [[ -f "$out_pbf" ]] && [[ "$FORCE" == false ]]; then
      continue
    fi
    local encoded_font
    encoded_font=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$font'))")
    curl -sSf --max-time 15 \
      "${base_url}/${encoded_font}/${range}.pbf" \
      -o "$out_pbf" 2>/dev/null || true
    any_downloaded=true
  done
  if $any_downloaded; then
    green "✓ Font: $font"
  else
    amber "⊘ Font: $font (already exists)"
  fi
}

# Protomaps fonts (used by the offline @protomaps/basemaps dark style)
PM_FONT_BASE="https://protomaps.github.io/basemaps-assets/fonts"
for font in "Noto Sans Regular" "Noto Sans Italic" "Noto Sans Medium"; do
  download_font_range "$PM_FONT_BASE" "$font"
done

# CARTO fonts (used by CARTO dark-matter style — kept for reference/fallback)
CARTO_FONT_BASE="https://tiles.basemaps.cartocdn.com/fonts"
for font in \
  "Open Sans Regular" "Open Sans Bold" "Open Sans Italic" \
  "Montserrat Regular" "Montserrat Medium" \
  "Montserrat Regular Italic" "Montserrat Medium Italic" \
  "NanumBarunGothic Regular" "HanWangHeiLight Regular"; do
  download_font_range "$CARTO_FONT_BASE" "$font"
done

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
bold "── Done ──────────────────────────────────────────────────────────────────"
echo ""
echo "  Region tiles:"
for f in europe wolfsburg berlin adelaide texas; do
  fp="$OUT/${f}.pmtiles"
  if [[ -f "$fp" ]]; then
    printf "    %-12s %s\n" "${f}.pmtiles" "$(du -sh "$fp" | cut -f1)"
  fi
done
echo ""
echo "  Total: $(du -sh "$OUT" | cut -f1)"
echo ""
echo "  Next step: run ./scripts/download-tiles.sh --help when ready to wire"
echo "  these into the map components (requires @protomaps/maplibre-pmtiles)."
