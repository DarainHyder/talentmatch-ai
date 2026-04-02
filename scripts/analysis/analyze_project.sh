#!/bin/bash

echo "🔍 PROJECT ANALYSIS SUITE"
echo "========================="
echo ""

# Run all analyses
echo "1. Running Ultra Quick Audit..."
./ultra_quick_audit.sh > quick_audit.txt
echo "✅ Saved to quick_audit.txt"

echo ""
echo "2. Creating Project Card..."
./create_project_card.sh > PROJECT_CARD.md
echo "✅ Saved to PROJECT_CARD.md"

echo ""
echo "3. Running Smart Analysis..."
./smart_project_analysis.sh > ANALYSIS.md
echo "✅ Saved to ANALYSIS.md"

echo ""
echo "4. Generating Onboarding Guide..."
./create_onboarding_guide.sh > ONBOARDING_GUIDE.md
echo "✅ Saved to ONBOARDING_GUIDE.md"

echo ""
echo "📊 SUMMARY"
echo "----------"
echo "• Frontend: $(grep -o "Frontend:.*" quick_audit.txt | head -1)"
echo "• Backend: $(grep -o "Backend:.*" quick_audit.txt | head -1 || echo "Not detected")"
echo "• Docker: $(grep -q "Docker: Ready" quick_audit.txt && echo "Yes" || echo "No")"
echo "• Auth System: $(grep -q "Authentication" ANALYSIS.md && echo "Yes" || echo "No")"

echo ""
echo "📁 FILES CREATED:"
ls -la quick_audit.txt PROJECT_CARD.md ANALYSIS.md ONBOARDING_GUIDE.md 2>/dev/null

echo ""
echo "🚀 RECOMMENDED FIRST STEP:"
grep -A2 "QUICK START" quick_audit.txt | tail -1
