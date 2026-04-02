#!/bin/bash
echo "🚀 PROJECT AUDIT - $(date)"
echo "========================"

echo ""
echo "1. PROJECT TYPE:"
if [ -f "package.json" ]; then
  echo "   Frontend: $(cat package.json | jq -r '.name // "Unknown"')"
  echo "   Framework: $(cat package.json | jq -r '.dependencies | keys | .[]' | grep -E 'react|vue|angular|svelte' | head -1)"
fi
if [ -d "backend" ]; then
  echo "   Backend: Python/Flask (detected)"
fi

echo ""
echo "2. KEY FILES EXIST:"
[ -f "docker-compose.yml" ] && echo "   ✅ docker-compose.yml"
[ -f "package.json" ] && echo "   ✅ package.json"
[ -f "backend/app.py" ] && echo "   ✅ backend/app.py"
[ -f "src/App.tsx" ] && echo "   ✅ src/App.tsx"

echo ""
echo "3. AUTH/RBAC STATUS:"
[ -f "src/contexts/AuthContext.tsx" ] && echo "   ✅ Frontend AuthContext exists"
[ -f "backend/routes/auth.py" ] && echo "   ✅ Backend auth routes exist"
[ -f "backend/models/rbac.py" ] && echo "   ✅ Backend RBAC models exist"

echo ""
echo "4. QUICK STATS:"
echo "   TypeScript files: $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Python files: $(find backend -name "*.py" 2>/dev/null | wc -l)"
echo "   Total lines (approx): $(find src backend -name "*.ts" -o -name "*.tsx" -o -name "*.py" 2>/dev/null | xargs wc -l | tail -1 | awk '{print $1}')"

echo ""
echo "5. DEPLOYMENT READY:"
[ -f "Dockerfile" ] && echo "   ✅ Dockerfile exists"
[ -f ".env.example" ] && echo "   ✅ Environment template exists"
[ -f "README.md" ] && echo "   ✅ Documentation exists"

echo ""
echo "🎯 WHAT'S MISSING:"
[ ! -f "src/lib/api.ts" ] && echo "   ❌ API client not found"
[ ! -f "backend/.env" ] && echo "   ❌ Backend .env not found"
[ ! -d "tests" ] && echo "   ❌ Test directory missing"

echo ""
echo "📊 RECOMMENDED NEXT:"
echo "   1. Connect AuthContext to backend auth"
echo "   2. Create API client if missing"
echo "   3. Set up environment variables"
