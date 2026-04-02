#!/bin/bash

echo "⚛️+🐍 REACT + FLASK PROJECT CLEANUP"
echo "=================================="
echo ""

# ALWAYS start with dry run
echo "📋 STEP 1: ANALYSIS (Dry Run)"
echo "------------------------------"
./safe_cleanup.sh true

echo ""
read -p "⚠️  Review above. Continue with actual cleanup? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo ""
echo "🗑️  STEP 2: CLEANING BUILD ARTIFACTS"
echo "-----------------------------------"

# React/Vite build artifacts (safe to remove, will be rebuilt)
echo "Removing React build artifacts..."
[ -d "dist" ] && echo "  📁 dist/" && rm -rf dist
[ -d ".vite" ] && echo "  📁 .vite/" && rm -rf .vite
[ -d ".next" ] && echo "  📁 .next/" && rm -rf .next

# Python build artifacts
echo ""
echo "Removing Python build artifacts..."
[ -d "__pycache__" ] && echo "  📁 __pycache__/" && rm -rf __pycache__
[ -d "*.egg-info" ] && echo "  📁 *.egg-info/" && rm -rf *.egg-info
[ -d "build" ] && echo "  📁 build/" && rm -rf build
[ -d "*.dist-info" ] && echo "  📁 *.dist-info/" && rm -rf *.dist-info

# Coverage reports
echo ""
echo "Removing test coverage reports..."
[ -d ".coverage" ] && echo "  📁 .coverage" && rm -rf .coverage
[ -d "htmlcov" ] && echo "  📁 htmlcov/" && rm -rf htmlcov
[ -f ".coverage.*" ] && echo "  📄 .coverage.*" && rm -f .coverage.*

echo ""
echo "🧹 STEP 3: RUNNING GENERAL CLEANUP"
echo "---------------------------------"
./safe_cleanup.sh false

echo ""
echo "📊 STEP 4: FINAL ANALYSIS"
echo "-------------------------"
echo "Remaining large directories:"
du -sh --exclude=node_modules --exclude=.git ./* 2>/dev/null | sort -hr | head -10

echo ""
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "🚀 Recommended next steps:"
echo "1. Run: npm install (if package.json changed)"
echo "2. Run: pip install -r requirements.txt (if Python deps changed)"
echo "3. Test: npm run build && python backend/app.py"
