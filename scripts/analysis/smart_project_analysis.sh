#!/bin/bash

echo "# 🔍 $(basename $(pwd)) - Project Analysis"
echo ""

# Detect project type
echo "## 🎯 PROJECT TYPE"
if [ -f "package.json" ] && [ -d "src" ] && [ -d "backend" ]; then
    echo "Full-Stack Web Application (React + Python Flask)"
elif [ -f "package.json" ] && [ -d "src" ]; then
    echo "Frontend Application (React)"
elif [ -d "backend" ] && [ -f "backend/requirements.txt" ]; then
    echo "Backend API (Python Flask)"
else
    echo "Mixed/Unknown"
fi
echo ""

# Main technologies
echo "## 🔧 MAIN TECHNOLOGIES"
echo '```'
[ -f "package.json" ] && grep -q "react" package.json && echo "Frontend: React"
[ -f "package.json" ] && [ -f "tsconfig.json" ] && echo "  Language: TypeScript"
[ -f "package.json" ] && [ -f "vite.config"* ] && echo "  Build: Vite"
[ -d "backend" ] && echo "Backend: Python Flask"
[ -f "docker-compose.yml" ] && echo "Deployment: Docker Compose"
echo '```'
echo ""

# Health check
echo "## 🏥 PROJECT HEALTH"
echo '```'
[ -f "README.md" ] && echo "✅ README exists"
[ -f ".gitignore" ] && echo "✅ .gitignore exists"
[ -f ".env.example" ] && echo "✅ .env.example exists"
[ ! -d "node_modules" ] || echo "⚠️  node_modules directory (should be gitignored)"
echo '```'
echo ""

# Entry points
echo "## 🚪 ENTRY POINTS"
echo '```'
[ -f "src/App.tsx" ] || [ -f "src/App.jsx" ] && echo "Frontend: src/App.*"
[ -f "backend/app.py" ] && echo "Backend: backend/app.py"
[ -f "docker-compose.yml" ] && echo "Docker: docker-compose.yml"
echo '```'
echo ""

# Detected features
echo "## 🔍 DETECTED FEATURES"
echo '```'
[ -f "src/contexts/AuthContext.tsx" ] && echo "✅ Frontend authentication"
[ -f "backend/routes/auth.py" ] && echo "✅ Backend authentication"
[ -f "backend/models/rbac.py" ] && echo "✅ RBAC models"
[ -f "docker-compose.yml" ] && echo "✅ Dockerized"
[ -f "backend/requirements.txt" ] && echo "✅ Python dependencies"
echo '```'
echo ""

# Quick start
echo "## 🚀 QUICK START"
echo '```'
echo "1. Setup:"
[ -f "package.json" ] && echo "   npm install"
[ -f "backend/requirements.txt" ] && echo "   pip install -r backend/requirements.txt"

echo ""
echo "2. Configure:"
[ -f ".env.example" ] && echo "   cp .env.example .env"

echo ""
echo "3. Run:"
[ -f "docker-compose.yml" ] && echo "   docker-compose up"
[ -f "package.json" ] && cat package.json | jq -r '.scripts.dev // .scripts.start // ""' 2>/dev/null | grep -q "." && echo "   npm run dev"
echo '```'
