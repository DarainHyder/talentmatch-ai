#!/bin/bash
echo "🧹 PROJECT CLEANUP ANALYSIS"
echo "==========================="
echo ""

# 1. Find large files
echo "📊 LARGE FILES (>1MB):"
find . -type f -size +1M 2>/dev/null | grep -v node_modules | grep -v .git | head -20

echo ""
# 2. Find duplicate/backup files
echo "🔁 DUPLICATE/BACKUP FILES:"
find . -type f \( -name "*.bak" -o -name "*.backup" -o -name "*.old" -o -name "*~" -o -name "*.tmp" \) 2>/dev/null | head -20

echo ""
# 3. Find Python cache
echo "🐍 PYTHON CACHE FILES:"
find . -type d -name "__pycache__" 2>/dev/null | head -10
find . -type f -name "*.pyc" 2>/dev/null | head -10

echo ""
# 4. Find build artifacts
echo "🏗️ BUILD ARTIFACTS:"
find . -type d \( -name "dist" -o -name "build" -o -name "out" -o -name ".next" \) 2>/dev/null
find . -type f \( -name "*.log" -o -name "*.pid" \) 2>/dev/null | head -10

echo ""
# 5. Find node_modules
echo "📦 NODE_MODULES (size):"
if [ -d "node_modules" ]; then
  du -sh node_modules 2>/dev/null || echo "  Exists (size unknown)"
fi

echo ""
# 6. Find IDE files
echo "💻 IDE/CONFIG FILES:"
find . -type f \( -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name ".vscode" -o -name ".idea" \) 2>/dev/null | head -10

echo ""
# 7. Disk usage by directory
echo "💾 DISK USAGE BY DIRECTORY:"
du -sh --exclude=node_modules --exclude=.git ./* 2>/dev/null | sort -hr | head -15
