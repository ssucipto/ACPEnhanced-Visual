#!/usr/bin/env bash
# acp-visualizer install script
# Installs to ~/.acp/visualizer/ and links globally
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash

set -e

INSTALL_DIR="${HOME}/.acp/visualizer"
REPO_URL="https://github.com/ssucipto/ACPEnhanced-Visual.git"

echo "📥 ACP Progress Visualizer Installer"
echo ""

# Clone if not already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "  ✓ Visualizer already installed at $INSTALL_DIR"
  echo "  → Updating..."
  cd "$INSTALL_DIR"
  git pull --ff-only
else
  echo "  → Cloning to $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  echo "  ✓ Cloned"
fi

# Install dependencies
echo "  → Installing dependencies..."
cd "$INSTALL_DIR"
npm install
echo "  ✓ Dependencies installed"

# Link the CLI globally (avoid npm link — it ignores user prefix on macOS)
echo "  → Linking acp-visualizer command..."
LOCAL_BIN="${HOME}/.local/bin"
mkdir -p "$LOCAL_BIN"

# Remove old symlink if it exists (from previous install attempts)
rm -f "$LOCAL_BIN/acp-visualizer"

# Create symlink directly — no npm link, no sudo
ln -sf "$INSTALL_DIR/bin/acp-visualizer.mjs" "$LOCAL_BIN/acp-visualizer"
chmod +x "$LOCAL_BIN/acp-visualizer"
echo "  ✓ Linked to $LOCAL_BIN/acp-visualizer"

# Check if ~/.local/bin is in PATH
if ! echo "$PATH" | tr ':' '\n' | grep -qF "$LOCAL_BIN"; then
  echo ""
  echo "  ⚠️  Add this to your shell profile (~/.zshrc):"
  echo "     export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
fi

echo ""
echo "✅ ACP Progress Visualizer installed!"
echo ""
echo "  Usage:"
echo "    acp-visualizer                           # auto-detect from CWD"
echo "    acp-visualizer --path /path/to/progress.yaml"
echo "    acp-visualizer --update                   # update to latest version"
echo "    acp-visualizer --repo owner/repo"
echo ""
echo "  Or via npx (zero-install):"
echo "    npx acp-visualizer"
