#!/bin/bash

echo "🎯 MASTER CLEANUP WORKFLOW"
echo "=========================="
echo ""

echo "📋 STEP 1: Analyze current clutter"
echo "----------------------------------"
./analyze_clutter.sh | tee clutter_analysis.txt

echo ""
read -p "View full analysis? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    less clutter_analysis.txt
fi

echo ""
echo "💾 STEP 2: Create backup (RECOMMENDED)"
echo "-------------------------------------"
read -p "Create backup before cleanup? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    ./backup_before_cleanup.sh
    echo ""
    read -p "✅ Backup created. Press Enter to continue..."
fi

echo ""
echo "🧪 STEP 3: Dry run cleanup"
echo "--------------------------"
echo "This will show what WOULD be deleted:"
echo ""
./cleanup_react_flask.sh

echo ""
echo "🚨 STEP 4: Final verification"
echo "----------------------------"
echo "Critical files that will REMAIN:"
echo ""
echo "✅ Source code:"
[ -d "src" ] && echo "  src/ - React components"
[ -d "backend" ] && echo "  backend/ - Python Flask"
echo ""
echo "✅ Configuration:"
[ -f "package.json" ] && echo "  package.json"
[ -f "docker-compose.yml" ] && echo "  docker-compose.yml"
[ -f ".env.example" ] && echo "  .env.example"
echo ""
echo "✅ Build scripts:"
[ -f "vite.config.ts" ] && echo "  vite.config.ts"
[ -f "Dockerfile" ] && echo "  Dockerfile"
echo ""

read -p "🚀 Proceed with ACTUAL cleanup? (Type 'YES' to confirm): " -r
if [[ ! $REPLY == "YES" ]]; then
    echo "❌ Cleanup cancelled. Your files are safe."
    exit 1
fi

echo ""
echo "🧹 STEP 5: Executing cleanup"
echo "---------------------------"
./cleanup_react_flask.sh

echo ""
echo "📈 STEP 6: Post-cleanup report"
echo "-----------------------------"
echo "Disk space freed:"
du -sh . 2>/dev/null
echo ""
echo "Clean directory structure:"
find . -maxdepth 2 -type d | grep -v node_modules | grep -v .git | sort

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Run: git status (see what changed)"
echo "2. Test: npm run dev (verify frontend works)"
echo "3. Test: python backend/app.py (verify backend works)"
echo "4. Optional: git add . && git commit -m 'Cleanup project structure'"
