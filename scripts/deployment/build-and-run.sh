#!/bin/bash

echo "🔨 BUILDING AND RUNNING TALENTMATCH PRODUCTION"
echo "=============================================="

# Clean up old containers
echo "Cleaning up old containers..."
docker-compose down 2>/dev/null

# Build frontend
echo "Building frontend..."
docker build -f Dockerfile.frontend -t talentmatch-frontend:latest .

# Build backend  
echo "Building backend..."
docker build -f Dockerfile.backend -t talentmatch-backend:latest .

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo "Checking services..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:5000"
    echo "   Health check: curl http://localhost:5000/health"
else
    echo "❌ Backend failed to start"
    docker-compose logs backend
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    docker-compose logs frontend
fi

echo ""
echo "🎉 TALENTMATCH IS READY!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
