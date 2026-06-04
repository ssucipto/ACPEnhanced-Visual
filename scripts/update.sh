#!/usr/bin/env bash
# acp-visualizer update script
# Fetches the latest visualizer from GitHub and updates dependencies
#
# Usage:
#   acp-visualizer --update
#   bash scripts/update.sh

set -euo pipefail

REPO_URL="https://github.com/ssucipto/ACPEnhanced-Visual.git"
REPO_BRANCH="main"
INSTALL_DIR="${HOME}/.acp/visualizer"

# ── Banner ──────────────────────────────────────────────────────────────────

echo "ACP Progress Visualizer Updater"
echo "================================"
echo ""

# ── Detect install location ────────────────────────────────────────────────

DIR=""
IS_NPX=false

# Prefer the persistent install dir over the current directory
if [ -d "$INSTALL_DIR/.git" ]; then
  DIR="$INSTALL_DIR"
  echo "  ✓ Found install at $INSTALL_DIR"
elif [ -f "package.json" ] && grep -q '"acp-visualizer"' package.json 2>/dev/null; then
  DIR="$(pwd)"
  # Detect if we're in a throwaway npx cache
  case "$DIR" in
    */_npx/*|*/npm/_npx/*|/tmp/*)
      IS_NPX=true
      echo "  ⚠ Running from npx cache — updates won't persist"
      if [ -d "$INSTALL_DIR/.git" ]; then
        echo "  → Switching to installed copy at $INSTALL_DIR"
        DIR="$INSTALL_DIR"
        IS_NPX=false
      else
        echo "  → Install first: curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash"
        exit 1
      fi
      ;;
    *)
      echo "  ✓ Found dev clone at $DIR"
      ;;
  esac
else
  echo "  ✗ Visualizer not found. Install first:"
  echo "    curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash"
  exit 1
fi

cd "$DIR"

# ── Pre-flight checks ───────────────────────────────────────────────────────

# Warn about uncommitted changes in dev clones
if [ "$DIR" != "$INSTALL_DIR" ]; then
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo ""
    echo "  ⚠️  Uncommitted changes detected. git pull may fail."
    echo "  → Commit or stash changes first, then re-run."
    exit 1
  fi
fi

# Detect and handle shallow clones
if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
  echo "  → Deepening shallow clone for update..."
  git fetch --unshallow origin "$REPO_BRANCH" 2>/dev/null || {
    # If unshallow fails, refetch from scratch
    git remote set-url origin "$REPO_URL" 2>/dev/null || true
    git fetch origin "$REPO_BRANCH" --depth=50
  }
fi

# ── Get current version ─────────────────────────────────────────────────────

OLD_VERSION=$(node -e "try{console.log(require('./package.json').version)}catch{console.log('unknown')}" 2>/dev/null || echo "unknown")

# ── Fetch updates ───────────────────────────────────────────────────────────

echo "  → Fetching latest from $REPO_URL..."
if ! git fetch origin "$REPO_BRANCH"; then
  echo "  ✗ Failed to fetch from GitHub. Check your network connection."
  exit 1
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$REPO_BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "  ✓ Already up to date (v${OLD_VERSION})"
  exit 0
fi

# Safe commit count (handles shallow clones gracefully)
COMMIT_COUNT=$(git rev-list --count HEAD.."origin/$REPO_BRANCH" 2>/dev/null || echo "?")
echo "  → Updates available: ${COMMIT_COUNT} commits behind"
echo ""

# ── Apply updates ───────────────────────────────────────────────────────────

echo "  → Pulling updates..."
if ! git pull --ff-only origin "$REPO_BRANCH"; then
  echo "  ✗ Pull failed. Your branch may have diverged."
  echo "  → Try: cd $DIR && git reset --hard origin/$REPO_BRANCH"
  exit 1
fi
echo "  ✓ Pulled latest"

echo "  → Installing dependencies..."
npm ci 2>/dev/null || npm install
echo "  ✓ Dependencies installed"

# ── Get new version ─────────────────────────────────────────────────────────

NEW_VERSION=$(node -e "try{console.log(require('./package.json').version)}catch{console.log('unknown')}" 2>/dev/null || echo "unknown")

# ── Show changelog ──────────────────────────────────────────────────────────

echo ""
echo "  Updated: v${OLD_VERSION} → v${NEW_VERSION}"
echo ""

echo "  Recent changes:"
if [ "$COMMIT_COUNT" != "?" ] && [ "$COMMIT_COUNT" -gt 0 ] 2>/dev/null; then
  git log --oneline "HEAD~${COMMIT_COUNT}..HEAD" 2>/dev/null | head -10 | sed 's/^/    • /'
else
  # Fallback: show last 5 commits
  git log --oneline -5 2>/dev/null | sed 's/^/    • /'
fi
echo ""

echo "================================"
echo "Update complete!"
echo ""
echo "  Usage:"
echo "    acp-visualizer                           # auto-detect from CWD"
echo "    acp-visualizer --path /path/to/progress.yaml"
echo ""
