#!/bin/bash

DRY_RUN=${1:-true}

echo "🧼 SAFE PROJECT CLEANUP"
echo "======================="
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN (no files deleted)" || echo "LIVE (files will be deleted)")"
echo ""

cleanup() {
  local pattern=$1
  local description=$2
  
  echo "🔍 $description:"
  find . -type f -name "$pattern" 2>/dev/null | while read file; do
    if [ "$DRY_RUN" = "true" ]; then
      echo "  📄 $file (would be removed)"
    else
      echo "  🗑️  Removing: $file"
      rm "$file"
    fi
  done
  echo ""
}

# 1. Temporary/backup files
cleanup "*~" "Temporary editor files"
cleanup "*.bak" "Backup files"
cleanup "*.backup" "Backup files"
cleanup "*.tmp" "Temporary files"

# 2. OS-specific files
cleanup ".DS_Store" "macOS DS_Store files"
cleanup "Thumbs.db" "Windows thumbnail files"
cleanup "desktop.ini" "Windows desktop config"

# 3. Editor swap files
cleanup "*.swp" "Vim swap files"
cleanup "*.swo" "Vim swap files"

# 4. Python cache (SAFE - these are always regenerated)
if [ "$DRY_RUN" = "true" ]; then
  echo "🐍 Python __pycache__ directories (would be removed):"
  find . -type d -name "__pycache__" 2>/dev/null | while read dir; do
    echo "  📁 $dir"
  done
else
  echo "🐍 Removing Python __pycache__ directories:"
  find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
fi
echo ""

# 5. Python bytecode
cleanup "*.pyc" "Python bytecode files"
cleanup "*.pyo" "Python optimized bytecode"

# 6. Log files
cleanup "*.log" "Log files"
cleanup "npm-debug.log*" "NPM debug logs"
cleanup "yarn-debug.log*" "Yarn debug logs"
cleanup "yarn-error.log*" "Yarn error logs"

echo "✅ Cleanup completed ($([ "$DRY_RUN" = "true" ] && echo "dry run" || echo "live mode"))"
