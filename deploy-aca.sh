#!/bin/bash
# Azure Container Apps Deployment Script for Engine Repair Pro
# Usage: ./deploy-aca.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_step() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking Prerequisites"
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI not installed"
        echo "Install from: https://aka.ms/InstallAzureCLIDeb"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not installed"
        exit 1
    fi
    
    print_success "Prerequisites OK"
}

# Configuration
configure() {
    print_step "Configuration"
    
    echo -e "${YELLOW}Enter your Azure details:${NC}"
    read -p "Resource Group Name (default: lawn-mower-rg): " RESOURCE_GROUP
    RESOURCE_GROUP=${RESOURCE_GROUP:-lawn-mower-rg}
    
    read -p "Location (default: eastus): " LOCATION
    LOCATION=${LOCATION:-eastus}
    
    read -p "ACR Name (must be globally unique, default: lawnmowerregistry): " REGISTRY_NAME
    REGISTRY_NAME=${REGISTRY_NAME:-lawnmowerregistry}
    
    read -p "Container App Name (default: lawn-mower-app): " CONTAINER_APP_NAME
    CONTAINER_APP_NAME=${CONTAINER_APP_NAME:-lawn-mower-app}
    
    read -r -s -p "DB Admin Password: " DB_PASSWORD
    echo ""
    if [[ -z "$DB_PASSWORD" ]]; then
        print_error "A database administrator password is required"
        exit 1
    fi
    
    # Other variables
    CONTAINER_ENV_NAME="${CONTAINER_APP_NAME}-env"
    DB_SERVER="${CONTAINER_APP_NAME}-db"
    DB_ADMIN_USER="pgadmin"
    IMAGE_NAME="lawn-mower-app"
    IMAGE_TAG="latest"
    
    print_success "Configuration set"
}

# Login to Azure
login_azure() {
    print_step "Logging in to Azure"
    az login
    print_success "Azure login complete"
}

# Create resource group
create_resource_group() {
    print_step "Creating Resource Group"
    az group create \
        --name $RESOURCE_GROUP \
        --location $LOCATION
    print_success "Resource group created: $RESOURCE_GROUP"
}

# Create container registry
create_registry() {
    print_step "Creating Azure Container Registry"
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $REGISTRY_NAME \
        --sku Basic
    
    ACR_LOGIN_SERVER=$(az acr show \
        --name $REGISTRY_NAME \
        --resource-group $RESOURCE_GROUP \
        --query loginServer --output tsv)
    
    print_success "Container registry created: $ACR_LOGIN_SERVER"
}

# Build and push image
build_and_push() {
    print_step "Building and Pushing Docker Image"
    
    az acr login --name $REGISTRY_NAME
    
    az acr build \
        --registry $REGISTRY_NAME \
        --image $IMAGE_NAME:$IMAGE_TAG \
        .
    
    print_success "Image pushed: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
}

# Create database
create_database() {
    print_step "Creating PostgreSQL Database"
    
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_SERVER \
        --location $LOCATION \
        --admin-user $DB_ADMIN_USER \
        --admin-password "$DB_PASSWORD" \
        --sku-name "Standard_B1s" \
        --tier "Burstable" \
        --version 16 \
        --yes
    
    sleep 30
    
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $DB_SERVER \
        --database-name "lawn_mower_business"
    
    POSTGRES_HOST=$(az postgres flexible-server show \
        --resource-group $RESOURCE_GROUP \
        --name $DB_SERVER \
        --query "fullyQualifiedDomainName" --output tsv)
    
    DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_PASSWORD}@${POSTGRES_HOST}:5432/lawn_mower_business?sslmode=require"
    
    print_success "Database created: $POSTGRES_HOST"
}

# Create container environment
create_environment() {
    print_step "Creating Container Apps Environment"
    
    az containerapp env create \
        --resource-group $RESOURCE_GROUP \
        --name $CONTAINER_ENV_NAME \
        --location $LOCATION
    
    print_success "Environment created: $CONTAINER_ENV_NAME"
}

# Create container app
create_container_app() {
    print_step "Creating Container App"
    
    API_KEY=$(openssl rand -base64 32)
    
    ACR_USERNAME=$(az acr credential show \
        --name $REGISTRY_NAME \
        --query username --output tsv)
    
    ACR_PASSWORD=$(az acr credential show \
        --name $REGISTRY_NAME \
        --query "passwords[0].value" --output tsv)
    
    az containerapp create \
        --resource-group $RESOURCE_GROUP \
        --name $CONTAINER_APP_NAME \
        --environment $CONTAINER_ENV_NAME \
        --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" \
        --registry-server $ACR_LOGIN_SERVER \
        --registry-username $ACR_USERNAME \
        --registry-password $ACR_PASSWORD \
        --target-port 3000 \
        --ingress external \
        --env-vars \
            DATABASE_URL="$DATABASE_URL" \
            API_KEY="$API_KEY" \
            NODE_ENV="production" \
            NEXT_PUBLIC_SITE_URL="https://${CONTAINER_APP_NAME}.azurecontainerapps.io" \
            NEXT_PUBLIC_SITE_NAME="Engine Repair Pro" \
            SEED_DATABASE="true" \
        --cpu 0.25 \
        --memory 512Mi \
        --min-replicas 1 \
        --max-replicas 1
    
    print_success "Container App created: $CONTAINER_APP_NAME"
    
    echo -e "${YELLOW}Store the generated API key in your password manager now.${NC}"
}

# Get deployment info
get_deployment_info() {
    print_step "Retrieving Deployment Information"
    
    sleep 30
    
    APP_FQDN=$(az containerapp show \
        --resource-group $RESOURCE_GROUP \
        --name $CONTAINER_APP_NAME \
        --query "properties.configuration.ingress.fqdn" --output tsv)
    
    print_success "Application deployed!"
}

# Display summary
display_summary() {
    print_step "🎉 DEPLOYMENT COMPLETE 🎉"
    
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}Application URL: ${YELLOW}https://${APP_FQDN}${NC}"
    echo -e "${GREEN}Resource Group: ${YELLOW}${RESOURCE_GROUP}${NC}"
    echo -e "${GREEN}Container App: ${YELLOW}${CONTAINER_APP_NAME}${NC}"
    echo -e "${GREEN}Container Registry: ${YELLOW}${ACR_LOGIN_SERVER}${NC}"
    echo -e "${GREEN}Database: ${YELLOW}${POSTGRES_HOST}${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Visit the application: https://${APP_FQDN}"
    echo "2. Check logs: az containerapp logs show -g ${RESOURCE_GROUP} -n ${CONTAINER_APP_NAME} --follow"
    echo "3. SSH into container: az containerapp exec -g ${RESOURCE_GROUP} -n ${CONTAINER_APP_NAME} --command-line /bin/sh"
    echo ""
    echo -e "${YELLOW}Cleanup (if needed):${NC}"
    echo "az group delete --name ${RESOURCE_GROUP} --yes --no-wait"
}

# Main execution
main() {
    print_step "🚀 Engine Repair Pro - Azure Container Apps Deployment"
    
    check_prerequisites
    configure
    login_azure
    create_resource_group
    create_registry
    build_and_push
    create_database
    create_environment
    create_container_app
    get_deployment_info
    display_summary
}

main
