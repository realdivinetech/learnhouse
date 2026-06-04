#!/usr/bin/env bash
# ============================================================================
# DigitalBridge Branding Patcher
# ============================================================================
# Re-applies DigitalBridge branding changes to the LearnHouse source tree.
# Run this after merging upstream changes if conflicts reset our files.
#
# Usage: bash scripts/apply-digitalbridge-branding.sh
# ============================================================================

set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)/apps/web"

info()  { echo -e "\033[0;32m[INFO]\033[0m $1"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m $1"; }

# ── 1. Replace SVG logos ────────────────────────────────────────────────
info "Replacing logo SVGs..."
cp -f customizations/assets/logo.svg "$WEB_DIR/public/lrn-dash.svg"
cp -f customizations/assets/logo.svg "$WEB_DIR/public/lrn.svg"
cp -f customizations/assets/logo.svg "$WEB_DIR/public/lrn-text.svg"
cp -f customizations/assets/logo.svg "$WEB_DIR/public/dashLogo.png"
cp -f customizations/assets/logo.svg "$WEB_DIR/public/black_logo.png"

# ── 2. Replace favicon ──────────────────────────────────────────────────
info "Replacing favicon..."
cp -f customizations/assets/favicon.svg "$WEB_DIR/public/favicon.ico"
cp -f customizations/assets/favicon.svg "$WEB_DIR/public/favicon.svg"

# ── 3. Update theme colors in globals.css ───────────────────────────────
info "Updating theme colors..."
CSS_FILE="$WEB_DIR/styles/globals.css"

if [ -f "$CSS_FILE" ]; then
  sed -i \
    's/--primary: 0 0% 9%;/--primary: 12 80% 62%;/g;
     s/--primary: 0 0% 98%;/--primary: 12 80% 62%;/g;
     s/--primary-foreground: 0 0% 98%;/--primary-foreground: 0 0% 100%;/g;
     s/--primary-foreground: 0 0% 9%;/--primary-foreground: 0 0% 100%;/g;
     s/--secondary: 0 0% 96.1%;/--secondary: 220 13% 26%;/g;
     s/--secondary: 0 0% 14.9%;/--secondary: 220 13% 26%;/g;
     s/--secondary-foreground: 0 0% 9%;/--secondary-foreground: 0 0% 98%;/g;
     s/--accent: 0 0% 96.1%;/--accent: 160 84% 39%;/g;
     s/--accent: 0 0% 14.9%;/--accent: 160 84% 39%;/g;
     s/--accent-foreground: 0 0% 9%;/--accent-foreground: 0 0% 100%;/g;
     s/--accent-foreground: 0 0% 98%;/--accent-foreground: 0 0% 100%;/g;
     s/--ring: 0 0% 3.9%;/--ring: 12 80% 62%;/g;
     s/--ring: 0 0% 83.1%;/--ring: 12 80% 62%;/g' "$CSS_FILE"
  info "  Theme colors updated."
else
  warn "  globals.css not found at $CSS_FILE — skipping."
fi

# ── 4. Copy CSS overrides ───────────────────────────────────────────────
info "Copying branding-overrides.css..."
mkdir -p "$WEB_DIR/styles"
cp -f customizations/styles/branding-overrides.css "$WEB_DIR/styles/"

# ── 5. Copy admin components ────────────────────────────────────────────
info "Copying admin components..."
mkdir -p "$WEB_DIR/components/Admin/BrandingCustomization"
cp -f customizations/admin-components/*.tsx "$WEB_DIR/components/Admin/BrandingCustomization/" 2>/dev/null || true

# ── 6. Copy custom assets ───────────────────────────────────────────────
info "Copying custom assets..."
mkdir -p "$WEB_DIR/public/custom-assets"
cp -f customizations/assets/* "$WEB_DIR/public/custom-assets/"
cp -f customizations/widget/ai-chat-widget.js "$WEB_DIR/public/custom-assets/" 2>/dev/null || true

info "DigitalBridge branding applied successfully."
echo ""
echo "Review changes with: git diff"
echo "Commit with:         git add -A && git commit -m 'chore: re-apply DigitalBridge branding'"
