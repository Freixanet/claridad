#!/usr/bin/env bash
# Genera contact sheet desde screenshots individuales.
# Uso: SCREENSHOT_DIR=docs/screenshots/after-phase5 TITLE='...' ./scripts/make-contact-sheet.sh
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${SCREENSHOT_DIR:-docs/screenshots/current}"
case "$DIR" in
  /*) ;;
  *) DIR="$REPO/$DIR" ;;
esac
OUT="$DIR/all-screens-contact-sheet.png"
TITLE="${TITLE:-Claridad — QA Visual}"

shopt -s nullglob
files=("$DIR"/[0-9][0-9]-*.png)
if ((${#files[@]} == 0)); then
  echo "No hay screenshots numerados en $DIR" >&2
  exit 1
fi

montage "${files[@]}" \
  -resize 390x844 \
  -tile 5x3 \
  -geometry +12+12 \
  -background '#F4F0E8' \
  -title "$TITLE" \
  "$OUT"

echo "Contact sheet: $OUT (${#files[@]} pantallas)"
