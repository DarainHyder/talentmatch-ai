#!/bin/bash

echo "🔍 VERIFYING DEPLOYMENT"
echo "======================"

echo ""
echo "1. Checking containers..."
docker-compose ps

echo ""
echo "2. Testing frontend assets..."
echo "   HTML status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"
echo "   CSS status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/assets/index-*.css 2>/dev/null || echo "N/A")"
echo "   JS status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/assets/index-*.js 2>/dev/null || echo "N/A")"

echo ""
echo "3. Testing backend..."
BACKEND_STATUS=$(curl -s http://localhost:5000/health 2>/dev/null || echo "Down")
echo "   Backend: $BACKEND_STATUS"

echo ""
echo "4. Checking container files..."
docker-compose exec frontend sh -c "ls -la /usr/share/nginx/html/ | head -10"

echo ""
echo "5. Quick content check..."
echo "   Page title: $(curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')"

echo ""
echo "✅ Verification complete!"
