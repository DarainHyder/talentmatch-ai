#!/bin/bash
set -e

API_URL=$1
TIMEOUT=60
INTERVAL=5

echo "Running smoke tests against: $API_URL"

# Wait for service to be ready
echo "Waiting for service to be ready..."
for i in $(seq 1 $((TIMEOUT / INTERVAL))); do
    if curl -s -f "$API_URL/health" > /dev/null; then
        echo "Service is up!"
        break
    fi
    echo "Waiting... ($i * ${INTERVAL}s)"
    sleep $INTERVAL
    if [ $i -eq $((TIMEOUT / INTERVAL)) ]; then
        echo "Service did not become ready within $TIMEOUT seconds"
        exit 1
    fi
done

# Run smoke tests
echo "Running health check..."
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')

if [ "$HEALTH_STATUS" != "healthy" ]; then
    echo "Health check failed: $HEALTH_RESPONSE"
    exit 1
fi

echo "Testing authentication endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/google")
if [ "$AUTH_RESPONSE" != "302" ]; then
    echo "Authentication endpoint returned $AUTH_RESPONSE"
    exit 1
fi

echo "All smoke tests passed!"
