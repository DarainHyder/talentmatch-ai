#!/bin/bash
echo "⚡ ULTRA-QUICK PROJECT AUDIT ⚡"
echo "Project: $(basename $(pwd))"
echo "---"

# 5-second checks
[ -f "package.json" ] && echo "📦 Frontend: $(cat package.json | jq -r '.name // "Unknown"')"
[ -f "requirements.txt" ] && echo "🐍 Backend: Python" && head -3 requirements.txt
[ -f "docker-compose.yml" ] && echo "🐳 Docker: Ready"
[ -f "src/App.tsx" ] && echo "⚛️  React + TypeScript"
[ -f "src/App.jsx" ] && echo "⚛️  React"

# What can I run?
echo ""
echo "🚀 QUICK START:"
[ -f "package.json" ] && cat package.json | jq -r '.scripts // {} | to_entries[] | "  npm run \(.key)"' 2>/dev/null | head -3
[ -f "docker-compose.yml" ] && echo "  docker-compose up"

# Biggest directory
echo ""
echo "📁 MAIN CODE:"
ls -la | grep -E "^(drwx.* (src|app|backend|lib|public))" | head -5 | awk '{print "  " $9}'

# Last modified
echo ""
echo "🕐 RECENT CHANGES:"
find . -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.js" 2>/dev/null | xargs ls -lt 2>/dev/null 2>/dev/null | head -3 | awk '{print "  " $6 " " $7 " " $9}'
