#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

RELEASE_DIR="release"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

VERSION=$(node -p "require('./package.json').version")

for BROWSER in chrome edge firefox; do
  DIST_DIR="dist/$BROWSER"
  if [ ! -d "$DIST_DIR" ]; then
    echo "Warning: $DIST_DIR not found, skipping $BROWSER"
    continue
  fi

  ZIP_NAME="resume-studio-extension-${BROWSER}-v${VERSION}.zip"
  echo "Zipping $BROWSER → $RELEASE_DIR/$ZIP_NAME"
  (cd "$DIST_DIR" && zip -r -q "../../$RELEASE_DIR/$ZIP_NAME" .)
done

echo ""
echo "Release zips:"
ls -lh "$RELEASE_DIR/"
