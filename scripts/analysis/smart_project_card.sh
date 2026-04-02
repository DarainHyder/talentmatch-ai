#!/bin/bash

echo "# 🔍 $(basename $(pwd)) - Smart Project Analysis"
echo ""

# Detect project type
detect_project_type() {
  if [ -f "package.json" ] && [ -d "src" ]; then
    echo "## 🎯 PROJECT TYPE: Full-Stack Web Application"
  elif [ -f "package.json" ]; then
    echo "## 🎯 PROJECT TYPE: Frontend Application"  
  elif [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
    echo "## 🎯 PROJECT TYPE: Backend API"
  elif [ -f "docker-compose.yml" ]; then
    echo "## 🎯 PROJECT TYPE: Microservices / Docker"
  else
    echo "## 🎯 PROJECT TYPE: Unknown"
  fi
}

# Find main technologies
find_main_tech() {
  echo "## 🔧 MAIN TECHNOLOGIES"
  echo '```'
  
  # Frontend
  if [ -f "package.json" ]; then
    REACT=$(grep -q "react" package.json && echo "React")
    VUE=$(grep -q "vue" package.json && echo "Vue")
    ANGULAR=$(grep -q "@angular/core" package.json && echo "Angular")
    echo "Frontend: ${REACT:-}${VUE:-}${ANGULAR:-}Unknown"
    
    # Build tool
    [ -f "vite.config"* ] && echo "Build: Vite"
    [ -f "webpack.config"* ] && echo "Build: Webpack"
    [ -f "next.config"* ] && echo "Framework: Next.js"
  fi
  
  # Backend  
  if [ -f "requirements.txt" ]; then
    grep -q "flask" requirements.txt && echo "Backend: Flask"
    grep -q "django" requirements.txt && echo "Backend: Django"
    grep -q "fastapi" requirements.txt && echo "Backend: FastAPI"
  fi
  
  # Database
  [ -f "docker-compose.yml" ] && grep -q "postgres" docker-compose.yml && echo "Database: PostgreSQL"
  [ -f "docker-compose.yml" ] && grep -q "mysql" docker-compose.yml && echo "Database: MySQL"
  [ -f "docker-compose.yml" ] && grep -q "mongodb" docker-compose.yml && echo "Database: MongoDB"
  
  echo '```'
  echo ""
}

# Architecture health check
architecture_check() {
  echo "## 🏛️ ARCHITECTURE HEALTH"
  echo '```'
  
  # Check for common issues
  [ ! -f ".gitignore" ] && echo "⚠️  No .gitignore file"
  [ -d "node_modules" ] && echo "⚠️  node_modules committed (should be in .gitignore)"
  [ ! -f "README.md" ] && echo "⚠️  No README.md"
  [ ! -f ".env.example" ] && [ -f ".env" ] && echo "⚠️  No .env.example template"
  
  # Check structure
  if [ -d "src" ]; then
    echo "✅ src/ directory exists"
    find src -maxdepth 1 -type d | wc -l | xargs echo "  Subdirectories:"
  fi
  
  if [ -d "backend" ]; then
    echo "✅ backend/ directory exists"
  fi
  
  echo '```'
  echo ""
}

# Find entry points
find_entry_points() {
  echo "## 🚪 ENTRY POINTS"
  echo '```'
  
  # Frontend
  if [ -f "src/App.tsx" ] || [ -f "src/App.jsx" ]; then
    echo "Frontend: src/App.*"
  fi
  
  if [ -f "src/main.tsx" ] || [ -f "src/main.jsx" ]; then
    echo "  Entry: src/main.*"
  fi
  
  # Backend
  BACKEND_ENTRY=$(find . -name "app.py" -o -name "main.py" -o -name "server.py" -o -name "index.py" | grep -v node_modules | head -3)
  if [ -n "$BACKEND_ENTRY" ]; then
    echo "Backend:"
    echo "$BACKEND_ENTRY" | sed 's|^\./||'
  fi
  
  echo '```'
  echo ""
}

# Detect what's working vs broken
detect_status() {
  echo "## 📈 PROJECT STATUS"
  echo '```'
  
  # Check if runs
  if [ -f "package.json" ]; then
    SCRIPTS=$(cat package.json | jq -r '.scripts.dev // .scripts.start // ""')
    if [ -n "$SCRIPTS" ]; then
      echo "✅ Can start with: npm run ${SCRIPTS%% *}"
    fi
  fi
  
  # Check Docker
  if [ -f "docker-compose.yml" ]; then
    echo "✅ Docker-compose ready"
  fi
  
  # Check tests
  TEST_COUNT=$(find . -name "*test*" -o -name "*spec*" | grep -v node_modules | wc -l)
  if [ $TEST_COUNT -gt 0 ]; then
    echo "✅ Tests found: $TEST_COUNT files"
  else
    echo "⚠️  No test files detected"
  fi
  
  # Check dependencies
  if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
    echo "✅ Dependencies locked"
  fi
  
  echo '```'
  echo ""
}

# Generate next steps
generate_next_steps() {
  echo "## 🎯 RECOMMENDED FIRST STEPS"
  echo '```'
  
  echo "1. SETUP:"
  if [ -f "package.json" ]; then echo "   npm install"; fi
  if [ -f "requirements.txt" ]; then echo "   pip install -r requirements.txt"; fi
  
  echo ""
  echo "2. CONFIGURE:"
  if [ -f ".env.example" ]; then echo "   cp .env.example .env"; fi
  
  echo ""
  echo "3. RUN:"
  if [ -f "docker-compose.yml" ]; then echo "   docker-compose up"; fi
  if [ -f "package.json" ]; then
    DEV_SCRIPT=$(cat package.json | jq -r '.scripts.dev // ""')
    START_SCRIPT=$(cat package.json | jq -r '.scripts.start // ""')
    [ -n "$DEV_SCRIPT" ] && echo "   npm run dev"
    [ -n "$START_SCRIPT" ] && echo "   npm start"
  fi
  
  echo ""
  echo "4. VERIFY:"
  echo "   Check browser at http://localhost:3000 (or port in config)"
  
  echo '```'
}

# Run all functions
detect_project_type
find_main_tech  
architecture_check
find_entry_points
detect_status
generate_next_steps

echo ""
echo "---"
echo "*Analysis complete. Save with: ./smart_project_card.sh > ANALYSIS.md*"
