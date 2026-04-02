# 🚀 ONBOARDING GUIDE: talentmatch
*Generated: Fri Dec 26 19:30:28 WCAST 2025*

## 📋 QUICK OVERVIEW
```
---
📦 Frontend: talentmatch
🐳 Docker: Ready
⚛️  React + TypeScript

🚀 QUICK START:
  npm run dev
  npm run build
  npm run preview
  docker-compose up
📖 README available

📁 MAIN CODE:
  backend
  public
  src

🕐 RECENT CHANGES:
  Dec 26 ./dist/assets/index-35af6a24.js
  Dec 26 ./dist/assets/vendor-fef53b54.js
  Dec 26 ./dist/assets/ui-2536f5d1.js
```

## 🏗️ TECH STACK
```
Frontend: talentmatch
Backend: Python Flask
Deployment: Docker Compose
```

## 📁 PROJECT STRUCTURE
```
Key directories:
src/ - Frontend source code
backend/ - Backend source code
public/ - Static assets
docker-compose.yml - Container orchestration
```

## 🚀 GETTING STARTED
```
# 1. Clone and setup
git clone <repository>
cd talentmatch

# 2. Install dependencies
npm install
cd backend && pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Run the application
docker-compose up
# OR
npm run dev
# In another terminal: cd backend && python app.py
```

## 🔑 KEY FILES TO KNOW
```
src/App.tsx - Main React component
src/contexts/AuthContext.tsx - Authentication
backend/app.py - Flask application
backend/routes/auth.py - Authentication API
backend/models/rbac.py - User roles/permissions
docker-compose.yml - Service definitions
```

## 📝 COMMON DEVELOPMENT TASKS
```
# Run tests

# Build for production
npm run build
```

## 🔧 TROUBLESHOOTING
```
1. Port already in use:
   - Change ports in .env or docker-compose.yml

2. Docker issues:
   - docker-compose down && docker-compose up --build

3. Dependency issues:
   - rm -rf node_modules package-lock.json && npm install
   - For Python: pip install --upgrade -r requirements.txt
```

---
*This guide was auto-generated. Update as needed.*
