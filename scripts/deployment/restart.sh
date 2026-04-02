#!/bin/bash

echo "🔄 RESTARTING TALENTMATCH"
echo "=========================="

# Stop and remove old containers
echo "Stopping old containers..."
docker-compose down

# Rebuild with latest changes
echo "Rebuilding images..."
docker-compose build

# Start fresh
echo "Starting services..."
docker-compose up -d

# Wait for startup
echo "Waiting for services to start..."
sleep 10

# Check status
echo "Checking services..."
echo ""

# Check backend
if curl -s http://localhost:5000/health | grep -q "healthy"; then
    echo "✅ Backend: http://localhost:5000/health"
else
    echo "❌ Backend not responding"
    docker-compose logs backend | tail -20
fi

# Check frontend (wait a bit longer)
sleep 5
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend not responding"
    docker-compose logs frontend | tail -20
fi

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "🎉 Done!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
