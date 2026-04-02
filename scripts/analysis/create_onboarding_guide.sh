#!/bin/bash

echo "# 🚀 ONBOARDING GUIDE: $(basename $(pwd))"
echo "*Generated: $(date)*"
echo ""

# Quick overview
echo "## 📋 QUICK OVERVIEW"
echo '```'
./ultra_quick_audit.sh | tail -n +3
echo '```'
echo ""

# Tech stack
echo "## 🏗️ TECH STACK"
echo '```'
[ -f "package.json" ] && echo "Frontend: $(cat package.json | jq -r '.name')"
[ -d "backend" ] && echo "Backend: Python Flask"
[ -f "docker-compose.yml" ] && echo "Deployment: Docker Compose"
echo '```'
echo ""

# Structure
echo "## 📁 PROJECT STRUCTURE"
echo '```'
echo "Key directories:"
[ -d "src" ] && echo "src/ - Frontend source code"
[ -d "backend" ] && echo "backend/ - Backend source code"
[ -d "public" ] && echo "public/ - Static assets"
[ -f "docker-compose.yml" ] && echo "docker-compose.yml - Container orchestration"
echo '```'
echo ""

# Getting started
echo "## 🚀 GETTING STARTED"
echo '```'
echo "# 1. Clone and setup"
echo "git clone <repository>"
echo "cd $(basename $(pwd))"
echo ""
echo "# 2. Install dependencies"
[ -f "package.json" ] && echo "npm install"
[ -f "backend/requirements.txt" ] && echo "cd backend && pip install -r requirements.txt"
echo ""
echo "# 3. Configure environment"
[ -f ".env.example" ] && echo "cp .env.example .env"
echo "# Edit .env with your settings"
echo ""
echo "# 4. Run the application"
[ -f "docker-compose.yml" ] && echo "docker-compose up"
echo "# OR"
[ -f "package.json" ] && echo "npm run dev"
[ -f "backend/app.py" ] && echo "# In another terminal: cd backend && python app.py"
echo '```'
echo ""

# Key files
echo "## 🔑 KEY FILES TO KNOW"
echo '```'
[ -f "src/App.tsx" ] && echo "src/App.tsx - Main React component"
[ -f "src/contexts/AuthContext.tsx" ] && echo "src/contexts/AuthContext.tsx - Authentication"
[ -f "backend/app.py" ] && echo "backend/app.py - Flask application"
[ -f "backend/routes/auth.py" ] && echo "backend/routes/auth.py - Authentication API"
[ -f "backend/models/rbac.py" ] && echo "backend/models/rbac.py - User roles/permissions"
[ -f "docker-compose.yml" ] && echo "docker-compose.yml - Service definitions"
echo '```'
echo ""

# Common tasks
echo "## 📝 COMMON DEVELOPMENT TASKS"
echo '```'
echo "# Run tests"
[ -f "package.json" ] && cat package.json | jq -r '.scripts.test // ""' | grep -q "." && echo "npm test"
echo ""
echo "# Build for production"
[ -f "package.json" ] && cat package.json | jq -r '.scripts.build // ""' | grep -q "." && echo "npm run build"
echo '```'
echo ""

# Troubleshooting
echo "## 🔧 TROUBLESHOOTING"
echo '```'
echo "1. Port already in use:"
echo "   - Change ports in .env or docker-compose.yml"
echo ""
echo "2. Docker issues:"
echo "   - docker-compose down && docker-compose up --build"
echo ""
echo "3. Dependency issues:"
echo "   - rm -rf node_modules package-lock.json && npm install"
echo "   - For Python: pip install --upgrade -r requirements.txt"
echo '```'
echo ""

echo "---"
echo "*This guide was auto-generated. Update as needed.*"
