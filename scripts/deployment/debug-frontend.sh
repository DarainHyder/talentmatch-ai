#!/bin/bash

echo "🔍 DEBUGGING FRONTEND ISSUES"
echo "============================"

echo ""
echo "1. Checking Docker containers..."
docker-compose ps

echo ""
echo "2. Checking frontend container files..."
docker-compose exec frontend ls -la /usr/share/nginx/html/

echo ""
echo "3. Checking nginx configuration..."
docker-compose exec frontend cat /etc/nginx/nginx.conf | head -30

echo ""
echo "4. Testing from inside container..."
docker-compose exec frontend curl -s http://localhost | head -50

echo ""
echo "5. Testing static assets..."
docker-compose exec frontend ls -la /usr/share/nginx/html/assets/ 2>/dev/null || echo "No assets directory"

echo ""
echo "6. Checking nginx error logs..."
docker-compose exec frontend tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"

echo ""
echo "7. Testing from host..."
echo "   HTML: curl -s http://localhost:3000 | head -5"
curl -s http://localhost:3000 | head -5
echo ""
echo "   CSS: curl -I http://localhost:3000/assets/index-*.css 2>/dev/null | head -1"
curl -I http://localhost:3000/assets/index-*.css 2>/dev/null | head -1 || echo "No CSS found"
echo ""
echo "   JS: curl -I http://localhost:3000/assets/index-*.js 2>/dev/null | head -1"
curl -I http://localhost:3000/assets/index-*.js 2>/dev/null | head -1 || echo "No JS found"
