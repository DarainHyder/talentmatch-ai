#!/bin/bash

echo "# 🎯 $(basename $(pwd)) - Project Card"
echo "*Generated: $(date)*"
echo ""

echo "## 🏗️ ARCHITECTURE"
echo '```'
[ -f "package.json" ] && echo "Frontend: $(cat package.json | jq -r '.dependencies | keys | .[]' | grep -E 'react|vue|angular|next' | head -1) + TypeScript"
[ -d "backend" ] && echo "Backend: $(find backend -name '*.py' | head -1 | xargs grep -l 'flask\|django\|fastapi' | head -1 | xargs basename)"
echo '```'
echo ""

echo "## 📁 KEY FILES"
echo '```'
find . -name "*.tsx" -o -name "*.py" | grep -i "auth\|app\|main\|index" | head -10 | sed 's|^\./||'
echo '```'
echo ""

echo "## 🔗 STATUS"
echo '```'
[ -f "src/contexts/AuthContext.tsx" ] && echo "✅ Frontend auth exists"
[ -f "backend/routes/auth.py" ] && echo "✅ Backend auth exists"
echo "❌ Not connected"
echo '```'

echo "## 🚀 NEXT: Connect auth frontend ↔ backend"
