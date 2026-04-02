#!/bin/bash

echo "🎯 TALENTMATCH-SPECIFIC CLEANUP"
echo "================================"
echo "Targeting known clutter in your project..."
echo ""

# 1. Remove duplicate/backup TypeScript files
echo "1. Removing TypeScript backup files (.jsx.backup):"
find src -name "*.jsx.backup" -type f | while read file; do
    echo "   🗑️  $file"
    rm "$file"
done

# 2. Clean Python cache at all levels
echo ""
echo "2. Cleaning Python cache:"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete

# 3. Remove IDE-specific directories (but keep .vscode if it has configs)
echo ""
echo "3. Cleaning IDE files (keeping .vscode if useful):"
if [ -d ".vscode" ]; then
    echo "   ℹ️  .vscode/ exists - checking if it's useful..."
    if [ "$(find .vscode -type f -name "*.json" | wc -l)" -eq 0 ]; then
        echo "   🗑️  Removing empty .vscode/"
        rm -rf .vscode
    else
        echo "   ✅ Keeping .vscode/ (contains configuration)"
    fi
fi

# 4. Remove OS-specific files
echo ""
echo "4. Removing OS-specific files:"
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete
find . -name "desktop.ini" -delete

# 5. Clean up duplicate/migration backups
echo ""
echo "5. Cleaning migration backups:"
if [ -d "backups" ]; then
    echo "   📁 backups/ exists"
    read -p "   Remove entire backups directory? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf backups
        echo "   🗑️  Removed backups/"
    else
        echo "   ✅ Keeping backups/"
    fi
fi

# 6. Clean dist directory (it will be rebuilt)
echo ""
echo "6. Cleaning build artifacts:"
if [ -d "dist" ]; then
    echo "   🗑️  Removing dist/ (will be rebuilt on next npm run build)"
    rm -rf dist
fi

# 7. Remove test coverage data
echo ""
echo "7. Cleaning test artifacts:"
[ -d ".coverage" ] && rm -rf .coverage
[ -d "htmlcov" ] && rm -rf htmlcov

echo ""
echo "✅ TALENTMATCH CLEANUP COMPLETE!"
echo ""
echo "📊 Remaining project size:"
du -sh --exclude=node_modules --exclude=.git . 2>/dev/null
echo ""
echo "🚀 Recommended: Run your tests to ensure nothing broke:"
echo "   npm run build && docker-compose up"
