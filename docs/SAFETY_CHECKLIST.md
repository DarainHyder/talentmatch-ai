# 🚨 PROJECT CLEANUP SAFETY CHECKLIST

## BEFORE CLEANING:
✅ [ ] Run: ./analyze_clutter.sh > analysis.txt
✅ [ ] Review analysis.txt for large/important files
✅ [ ] Backup: ./backup_before_cleanup.sh
✅ [ ] Verify backup: ls -la backup_*/ and test a file
✅ [ ] Commit current state: git add . && git commit -m "Pre-cleanup state"

## SAFE TO DELETE (Usually):
- __pycache__/ directories
- *.pyc, *.pyo files
- *.log files (except important application logs)
- dist/, build/, out/ directories (can be rebuilt)
- .DS_Store, Thumbs.db, desktop.ini
- *.tmp, *~, *.bak, *.backup files
- node_modules/ (CAN be deleted, will be rebuilt with npm install)

## DANGEROUS TO DELETE (Be careful!):
- src/ (source code)
- backend/ (backend code)
- package.json, requirements.txt (dependencies)
- .env* files (environment variables)
- docker-compose.yml, Dockerfile
- *.config.* files (configuration)
- README.md, docs/

## AFTER CLEANING:
✅ [ ] Test: npm run dev (frontend works)
✅ [ ] Test: python backend/app.py (backend works)
✅ [ ] Test: docker-compose up (containers work)
✅ [ ] Run: git status (see what changed)
✅ [ ] Optional: git add . && git commit -m "Cleaned project"

## RECOVERY PLAN:
If something breaks:
1. Check backup: cp -r backup_*/ .
2. Or git restore: git checkout -- .
3. Reinstall deps: npm install && pip install -r requirements.txt
