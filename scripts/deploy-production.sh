#!/bin/bash
set -e  # Exit on error

echo "🚀 DEPLOYING TALENTMATCH TO PRODUCTION"
echo "======================================"

# Load environment
export ENVIRONMENT="production"
export AWS_REGION="us-east-1"
export PROJECT_NAME="talentmatch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_success() { echo -e "${GREEN}✓ $1${NC}"; }
log_info() { echo -e "${YELLOW}➔ $1${NC}"; }
log_error() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not installed. Install with: brew install awscli"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker not installed"
    fi
    
    # Check credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run: aws configure"
    fi
    
    log_success "All prerequisites satisfied"
}

# Deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying AWS infrastructure..."
    
    # Create CloudFormation stack
    STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
    
    aws cloudformation deploy \
        --template-file infrastructure/aws/production-stack.yml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            EnvironmentName=$ENVIRONMENT \
            DomainName=talentmatch.com \
        --capabilities CAPABILITY_IAM \
        --no-fail-on-empty-changeset
    
    # Get outputs
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
        --output text)
    
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" \
        --output text)
    
    log_success "Infrastructure deployed"
    echo "  Database: $DB_ENDPOINT"
    echo "  Load Balancer: $ALB_DNS"
}

# Build and push Docker images
build_docker_images() {
    log_info "Building Docker images..."
    
    # Login to ECR
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Create ECR repositories if they don't exist
    for SERVICE in backend frontend; do
        if ! aws ecr describe-repositories --repository-names $PROJECT_NAME/$SERVICE &> /dev/null; then
            aws ecr create-repository --repository-name $PROJECT_NAME/$SERVICE
        fi
    done
    
    # Build backend
    docker build -f Dockerfile.backend -t $ECR_REGISTRY/$PROJECT_NAME/backend:latest .
    docker push $ECR_REGISTRY/$PROJECT_NAME/backend:latest
    
    # Build frontend
    docker build -f Dockerfile.frontend -t $ECR_REGISTRY/$PROJECT_NAME/frontend:latest .
    docker push $ECR_REGISTRY/$PROJECT_NAME/frontend:latest
    
    log_success "Docker images built and pushed"
}

# Deploy to ECS
deploy_to_ecs() {
    log_info "Deploying to ECS..."
    
    # Create ECS task definitions
    cat > ecs-task-backend.json << TASKEOF
{
    "family": "${PROJECT_NAME}-backend",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "backend",
            "image": "${ECR_REGISTRY}/${PROJECT_NAME}/backend:latest",
            "portMappings": [{"containerPort": 5000, "protocol": "tcp"}],
            "environment": [
                {"name": "ENVIRONMENT", "value": "${ENVIRONMENT}"},
                {"name": "DATABASE_URL", "value": "postgresql://user:pass@${DB_ENDPOINT}/talentmatch"},
                {"name": "REDIS_URL", "value": "redis://redis.talentmatch.com:6379"}
            ],
            "secrets": [
                {
                    "name": "JWT_SECRET_KEY",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:talentmatch/jwt-secret:JWT_SECRET_KEY::"
                },
                {
                    "name": "GOOGLE_CLIENT_ID",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:talentmatch/google-oauth:GOOGLE_CLIENT_ID::"
                },
                {
                    "name": "GOOGLE_CLIENT_SECRET",
                    "valueFrom": "arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:talentmatch/google-oauth:GOOGLE_CLIENT_SECRET::"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${PROJECT_NAME}-backend",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
TASKEOF
    
    # Register task definition
    aws ecs register-task-definition --cli-input-json file://ecs-task-backend.json
    
    # Create or update ECS service
    if ! aws ecs describe-services --cluster $PROJECT_NAME-cluster --services $PROJECT_NAME-backend &> /dev/null; then
        # Create new service
        aws ecs create-service \
            --cluster $PROJECT_NAME-cluster \
            --service-name $PROJECT_NAME-backend \
            --task-definition $PROJECT_NAME-backend \
            --desired-count 2 \
            --launch-type FARGATE \
            --platform-version LATEST \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
            --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:${AWS_REGION}:${AWS_ACCOUNT_ID}:targetgroup/tg-backend/xxx,containerName=backend,containerPort=5000"
    else
        # Update service
        aws ecs update-service \
            --cluster $PROJECT_NAME-cluster \
            --service $PROJECT_NAME-backend \
            --task-definition $PROJECT_NAME-backend \
            --force-new-deployment
    fi
    
    log_success "ECS service deployed"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Wait for service to stabilize
    sleep 60
    
    # Test health endpoint
    HEALTH_URL="http://${ALB_DNS}/health"
    if curl -s $HEALTH_URL | grep -q "healthy"; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
    fi
    
    # Test API endpoints
    API_URL="http://${ALB_DNS}/api/test"
    if curl -s $API_URL | grep -q "working"; then
        log_success "API test passed"
    else
        log_error "API test failed"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    deploy_infrastructure
    build_docker_images
    deploy_to_ecs
    run_smoke_tests
    
    log_success "🎉 PRODUCTION DEPLOYMENT COMPLETE!"
    echo ""
    echo "Next steps:"
    echo "1. Configure DNS to point to ${ALB_DNS}"
    echo "2. Set up SSL certificates with AWS Certificate Manager"
    echo "3. Configure monitoring and alerts"
    echo "4. Enable auto-scaling policies"
}

# Run main function
main "$@"
