#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: ./scripts/create-from-template.sh <project-name> [target-parent-dir]"
  exit 1
fi

PROJECT_NAME="$1"
TARGET_PARENT_DIR="${2:-$(pwd)}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$TARGET_PARENT_DIR/$PROJECT_NAME"

if [[ -e "$TARGET_DIR" ]]; then
  echo "Target directory already exists: $TARGET_DIR"
  exit 1
fi

mkdir -p "$TARGET_DIR"

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='package-lock.json' \
  --exclude='tsconfig.tsbuildinfo' \
  "$TEMPLATE_ROOT/" "$TARGET_DIR/"

(
  cd "$TARGET_DIR"
  node ./scripts/rename-project.mjs "$PROJECT_NAME"
)

echo ""
echo "Project created at: $TARGET_DIR"
echo "Next steps:"
echo "  cd $TARGET_DIR"
echo "  npm install"
echo "  npm run lint && npm run typecheck && npm run test && npm run build"
