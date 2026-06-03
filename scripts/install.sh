#!/usr/bin/env bash
# acp-visualizer install script
# Installs to ~/.acp/visualizer/ and links globally

set -e

INSTALL_DIR="${HOME}/.acp/visualizer"
REPO_URL="https://github.com/ssucipto/ACPEnhanced-Visual.git"

echo "📥 ACP Progress Visualizer Installer"
echo ""

# Clone if not already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "  ✓ Visualizer already installed at $INSTALL_DIR"
  echo "  → Run: cd $INSTALL_DIR && git pull"
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

# Link globally
echo "  → Linking acp-visualizer command..."
npm link
echo "  ✓ Linked"

echo ""
echo "✅ ACP Progress Visualizer installed!"
echo ""
echo "  Usage:"
echo "    acp-visualizer                           # auto-detect from CWD"
echo "    acp-visualizer --path /path/to/progress.yaml"
echo "    acp-visualizer --repo owner/repo"
echo ""
echo "  Or from any ACP Enhanced project:"
echo "    /acp-visualize"
