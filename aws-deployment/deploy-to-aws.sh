#!/bin/bash

# AWS ECS Deployment Script for PDL-145T Management System
# Prerequisites: AWS CLI installed and configured

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CLUSTER_NAME="pdl-145t-cluster"
SERVICE_NAME="pdl-145t-service"
TASK_DEFINITION_NAME="pdl-145t-management-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS deployment for PDL-145T Management System...${NC}"

# 1. Create ECR repositories
echo -e "${YELLOW}Creating ECR repositories...${NC}"
aws ecr create-repository --repository-name pdl-backend --region $AWS_REGION 2>/dev/null || true
aws ecr create-repository --repository-name pdl-frontend --region $AWS_REGION 2>/dev/null || true

# 2. Get ECR login token
echo -e "${YELLOW}Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 3. Build and push backend image
echo -e "${YELLOW}Building and pushing backend image...${NC}"
cd ../backend
docker build -t pdl-backend .
docker tag pdl-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pdl-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pdl-backend:latest

# 4. Build and push frontend image
echo -e "${YELLOW}Building and pushing frontend image...${NC}"
cd ../frontend
docker build -t pdl-frontend .
docker tag pdl-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pdl-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pdl-frontend:latest

# 5. Create ECS cluster
echo -e "${YELLOW}Creating ECS cluster...${NC}"
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || true

# 6. Create CloudWatch log group
echo -e "${YELLOW}Creating CloudWatch log group...${NC}"
aws logs create-log-group --log-group-name /ecs/pdl-145t-management-system --region $AWS_REGION 2>/dev/null || true

# 7. Update task definition with actual values
echo -e "${YELLOW}Updating task definition...${NC}"
cd ../aws-deployment
sed -i "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" ecs-task-definition.json
sed -i "s/YOUR_REGION/$AWS_REGION/g" ecs-task-definition.json

# 8. Register task definition
echo -e "${YELLOW}Registering task definition...${NC}"
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region $AWS_REGION

# 9. Create or update service
echo -e "${YELLOW}Creating/updating ECS service...${NC}"
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --region $AWS_REGION 2>/dev/null || \
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --region $AWS_REGION

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Check your ECS console for service status.${NC}"
