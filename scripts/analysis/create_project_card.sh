#!/bin/bash

echo "# 🎯 $(basename $(pwd)) - Project Card"
echo "*Auto-generated: $(date)*"
echo ""

# 1. DETECT TECH STACK
echo "## 🏗️ TECH STACK"
echo '```'
# Frontend framework
if [ -f "package.json" ]; then
  PKG_NAME=$(cat package.json | jq -r '.name // "Unknown"')
  echo "Project: $PKG_NAME"
  
  # Detect framework
  if grep -q "react" package.json; then
    echo "Frontend: React"
  fi
  
  [ -f "vite.config"* ] && echo "  Build: Vite"
  [ -f "webpack.config"* ] && echo "  Build: Webpack"
  [ -f "next.config"* ] && echo "  Framework: Next.js"
  [ -f "tsconfig.json" ] && echo "  Language: TypeScript"
  [ -f "tailwind.config"* ] && echo "  CSS: Tailwind"
fi

# Backend language
if [ -f "requirements.txt" ] || [ -f "Pipfile" ] || [ -f "pyproject.toml" ]; then
  echo "Backend: Python"
  [ -f "requirements.txt" ] && grep -iq "flask" requirements.txt && echo "  Framework: Flask"
  [ -f "requirements.txt" ] && grep -iq "django" requirements.txt && echo "  Framework: Django"
  [ -f "requirements.txt" ] && grep -iq "fastapi" requirements.txt && echo "  Framework: FastAPI"
fi

# Database
if [ -f "docker-compose.yml" ]; then
  grep -q "postgres" docker-compose.yml && echo "Database: PostgreSQL"
  grep -q "mysql" docker-compose.yml && echo "Database: MySQL"
  grep -q "mongodb" docker-compose.yml && echo "Database: MongoDB"
fi

# Deployment
[ -f "Dockerfile" ] && echo "Deployment: Docker"
[ -f "docker-compose.yml" ] && echo "  Orchestration: docker-compose"
echo '```'
echo ""

# 2. PROJECT STRUCTURE
echo "## 📁 PROJECT STRUCTURE"
echo '```'
find . -maxdepth 2 -type d 2>/dev/null | grep -v node_modules | grep -v .git | grep -v __pycache__ | sort | head -15
echo '```'
echo ""

# 3. KEY FILES
echo "## 🔑 KEY FILES"
echo '```'
# Entry points
echo "Entry Points:"
find . -type f \( -name "App.*" -o -name "app.*" -o -name "main.*" -o -name "index.*" \) 2>/dev/null | grep -v node_modules | grep -v __pycache__ | head -5 | sed 's|^\./||'
echo ""
echo "Configurations:"
find . -maxdepth 2 -type f \( -name "*.env*" -o -name "*config*" \) 2>/dev/null | head -5 | sed 's|^\./||'
echo '```'
echo ""

# 4. DEPENDENCIES SUMMARY
echo "## 📦 DEPENDENCIES"
echo '```'
if [ -f "package.json" ]; then
  echo "Frontend Dependencies:"
  cat package.json | jq -r '.dependencies // {} | keys[]' 2>/dev/null | head -5 | tr '\n' ' '
  echo ""
fi
echo '```'
echo ""

# 5. DETECTED FEATURES
echo "## 🔍 DETECTED FEATURES"
echo '```'
# Auth detection
AUTH_FILES=$(find . -type f \( -name "*auth*" -o -name "*Auth*" \) 2>/dev/null | grep -v node_modules | grep -v __pycache__ | head -2)
if [ -n "$AUTH_FILES" ]; then
  echo "✅ Authentication:"
  echo "$AUTH_FILES" | sed 's|^\./||' | sed 's/^/  /'
fi

# Docker
[ -f "Dockerfile" ] && echo "✅ Dockerized"
[ -f "docker-compose.yml" ] && echo "✅ docker-compose ready"
echo '```'
echo ""

# 6. GETTING STARTED
echo "## 🚀 GETTING STARTED"
echo '```'
if [ -f "package.json" ]; then
  echo "# Install dependencies"
  echo "npm install"
  echo ""
  echo "# Available scripts:"
  cat package.json | jq -r '.scripts // {} | keys[]' 2>/dev/null | head -5 | while read script; do
    echo "npm run $script"
  done
fi

if [ -f "docker-compose.yml" ]; then
  echo ""
  echo "# Start with Docker"
  echo "docker-compose up"
fi
echo '```'
echo ""

# 7. COMMON TASKS
echo "## 📝 COMMON NEXT STEPS"
echo '```'
echo "1. Check .env.example or .env for configuration"
echo "2. Run npm install / pip install"
echo "3. Start development server"
echo "4. Check README.md for project-specific instructions"
echo '```'
