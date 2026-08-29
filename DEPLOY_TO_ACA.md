# Azure Container Apps Deployment Guide

## Quick Deploy (5 minutes)

### Prerequisites
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set subscription (optional if you have multiple)
az account set --subscription "your-subscription-id"
```

### Step 1: Set Variables
```bash
#!/bin/bash

# Resource naming
RESOURCE_GROUP="lawn-mower-rg"
LOCATION="eastus"
REGISTRY_NAME="lawnmowerregistry"  # Must be globally unique
IMAGE_NAME="lawn-mower-app"
IMAGE_TAG="latest"
CONTAINER_APP_NAME="lawn-mower-app"
CONTAINER_ENV_NAME="lawn-mower-env"
DB_SERVER="lawn-mower-db"
DB_ADMIN_USER="pgadmin"
read -r -s -p "Database administrator password: " DB_PASSWORD
echo

# Export for later use
export RESOURCE_GROUP LOCATION REGISTRY_NAME CONTAINER_APP_NAME CONTAINER_ENV_NAME
```

### Step 2: Create Resource Group
```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### Step 3: Create Azure Container Registry
```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic

# Get registry URL
ACR_LOGIN_SERVER=$(az acr show --name $REGISTRY_NAME \
  --resource-group $RESOURCE_GROUP \
  --query loginServer --output tsv)

echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

### Step 4: Build and Push Container Image
```bash
# Login to ACR
az acr login --name $REGISTRY_NAME

# Build image
az acr build \
  --registry $REGISTRY_NAME \
  --image $IMAGE_NAME:$IMAGE_TAG \
  .

# Or build locally and push
docker build -t $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG .
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
```

### Step 5: Create PostgreSQL Database
```bash
# Create Azure Database for PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_PASSWORD \
  --sku-name "Standard_B1s" \
  --tier "Burstable" \
  --version 16

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER \
  --database-name "lawn_mower_business"

# Get connection string
POSTGRES_HOST=$(az postgres flexible-server show \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --query "fullyQualifiedDomainName" --output tsv)

DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_PASSWORD}@${POSTGRES_HOST}:5432/lawn_mower_business?sslmode=require"

echo "Database URL: $DATABASE_URL"
```

### Step 6: Create Container Apps Environment
```bash
# Create environment with Log Analytics
az containerapp env create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_ENV_NAME \
  --location $LOCATION
```

### Step 7: Create Container App
```bash
# Generate API key
API_KEY=$(openssl rand -base64 32)

# Create the container app
az containerapp create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --environment $CONTAINER_ENV_NAME \
  --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $(az acr credential show \
      --name $REGISTRY_NAME \
      --query username --output tsv) \
  --registry-password $(az acr credential show \
      --name $REGISTRY_NAME \
      --query "passwords[0].value" --output tsv) \
  --target-port 3000 \
  --ingress external \
  --env-vars \
    DATABASE_URL="$DATABASE_URL" \
    API_KEY="$API_KEY" \
    NODE_ENV="production" \
    NEXT_PUBLIC_SITE_URL="https://$CONTAINER_APP_NAME.azurecontainerapps.io" \
    NEXT_PUBLIC_SITE_NAME="Engine Repair Pro" \
  --cpu 0.25 \
  --memory 512Mi \
  --min-replicas 1 \
  --max-replicas 1
```

### Step 8: Run Database Migrations
```bash
# Wait for app to start (2-3 minutes)
sleep 180

# Get container app FQDN
APP_FQDN=$(az containerapp show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --query "properties.configuration.ingress.fqdn" --output tsv)

echo "Application running at: https://$APP_FQDN"

# For database initialization, you can:
# 1. SSH into container and run migrations
# 2. Or set up init script in container startup

# SSH into container
az containerapp exec \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --command-line "/bin/sh"

# Inside container:
# npx prisma migrate deploy
# node seed.js
```

### Step 9: Configure Auto-scaling (Optional - Skip for Cost Savings)
```bash
# SKIP for budget constraints - fixed 1 replica keeps costs low

# Only enable if you expect traffic spikes:
# az containerapp update \
#   --resource-group $RESOURCE_GROUP \
#   --name $CONTAINER_APP_NAME \
#   --min-replicas 1 \
#   --max-replicas 3 \
#   --revision-suffix autoscale-v1
```

### Step 10: Verify Deployment
```bash
# Check container app status
az containerapp show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME

# Get logs
az containerapp logs show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --follow

# Test API
curl https://$APP_FQDN/api/services
curl https://$APP_FQDN/

# Test security headers
curl -i https://$APP_FQDN/api/services | grep -E "^(X-|Content-Security|Strict-Transport)"
```

---

## Complete Deployment Script

Save as `deploy-to-aca.sh`:

```bash
#!/bin/bash
set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
RESOURCE_GROUP="lawn-mower-rg"
LOCATION="eastus"
REGISTRY_NAME="lawnmowerregistry"
IMAGE_NAME="lawn-mower-app"
IMAGE_TAG="latest"
CONTAINER_APP_NAME="lawn-mower-app"
CONTAINER_ENV_NAME="lawn-mower-env"
DB_SERVER="lawn-mower-db"
DB_ADMIN_USER="pgadmin"
read -r -s -p "Database administrator password: " DB_PASSWORD
echo

echo -e "${YELLOW}Starting Azure Container Apps deployment...${NC}"

# Step 1: Create resource group
echo -e "${YELLOW}[1/7] Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Step 2: Create ACR
echo -e "${YELLOW}[2/7] Creating Azure Container Registry...${NC}"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic

ACR_LOGIN_SERVER=$(az acr show --name $REGISTRY_NAME \
  --resource-group $RESOURCE_GROUP \
  --query loginServer --output tsv)

echo -e "${GREEN}ACR created: $ACR_LOGIN_SERVER${NC}"

# Step 3: Build and push image
echo -e "${YELLOW}[3/7] Building and pushing Docker image...${NC}"
az acr login --name $REGISTRY_NAME

az acr build \
  --registry $REGISTRY_NAME \
  --image $IMAGE_NAME:$IMAGE_TAG \
  .

echo -e "${GREEN}Image pushed: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG${NC}"

# Step 4: Create database
echo -e "${YELLOW}[4/7] Creating PostgreSQL database...${NC}"
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

# Wait for database to be ready
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

echo -e "${GREEN}Database created at: $POSTGRES_HOST${NC}"

# Step 5: Create Container Apps environment
echo -e "${YELLOW}[5/7] Creating Container Apps environment...${NC}"
az containerapp env create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_ENV_NAME \
  --location $LOCATION

echo -e "${GREEN}Environment created${NC}"

# Step 6: Generate API key
API_KEY=$(openssl rand -base64 32)

# Step 7: Create container app
echo -e "${YELLOW}[6/7] Creating Container App...${NC}"

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
    NEXT_PUBLIC_SITE_URL="https://$CONTAINER_APP_NAME.azurecontainerapps.io" \
    NEXT_PUBLIC_SITE_NAME="Engine Repair Pro" \
  --cpu 0.25 \
  --memory 512Mi \
  --min-replicas 1 \
  --max-replicas 1

echo -e "${GREEN}Container App created${NC}"

# Step 8: Get FQDN
echo -e "${YELLOW}[7/7] Retrieving deployment information...${NC}"
sleep 30

APP_FQDN=$(az containerapp show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --query "properties.configuration.ingress.fqdn" --output tsv)

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Application URL: https://$APP_FQDN${NC}"
echo -e "${GREEN}Resource Group: $RESOURCE_GROUP${NC}"
echo -e "${GREEN}Container App: $CONTAINER_APP_NAME${NC}"
echo -e "${GREEN}API Key: $API_KEY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. SSH into container: az containerapp exec -g $RESOURCE_GROUP -n $CONTAINER_APP_NAME --command-line /bin/sh"
echo "2. Run migrations: npx prisma migrate deploy"
echo "3. Seed database: node seed.js"
echo "4. Test API: curl https://$APP_FQDN/api/services"
```

### Running the Script
```bash
# Make executable
chmod +x deploy-to-aca.sh

# Run deployment
./deploy-to-aca.sh
```

---

## Cleanup

To delete all resources:
```bash
az group delete \
  --resource-group $RESOURCE_GROUP \
  --yes --no-wait
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
az containerapp logs show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --follow
```

### Database connection failing
```bash
# Verify firewall rules
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --rule-name "AllowContainerApps" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### 500 errors
- Check DATABASE_URL format
- Verify migrations have run
- Check API_KEY is set

---

## Cost Estimates (Budget-Optimized)

- Container App (0.25 CPU, 512MB RAM, 1 replica): ~$5-7/month
- PostgreSQL Flexible Server (B1s, burstable): ~$15-20/month
- Container Registry (Basic): ~$5/month
- **Total: ~$25-35/month**

### Cost Reduction Tips
1. **Minimize replicas**: Set `--min-replicas 1 --max-replicas 1` (no auto-scaling)
2. **Right-size compute**: Use 0.25 CPU + 512MB memory for low traffic
3. **Use burstable database tier**: Saves 40% vs standard
4. **Monitor spending**: `az cost-management query create` or Azure Cost Management
5. **Stop when not needed**: `az containerapp stop` to pause app (keep database running)
6. **Delete dev resources**: Remove unused resource groups immediately

### Estimated Monthly Breakdown
| Resource | Cost |
|----------|------|
| Container App (0.25 CPU, 512MB) | $5-7 |
| PostgreSQL B1s 20GB | $15-20 |
| Container Registry (Basic) | $5 |
| Data transfer (minimal) | $0-2 |
| **Total** | **$25-35** |

### Further Savings (if needed)
- Use **App Service Plan** (Linux) instead: $10-15/month (cheaper than Container Apps)
- Use **PostgreSQL Single Server** (cheaper but deprecated): $10-15/month
- Combine: **~$20-30/month** for App Service + Single Server

---

## Next: Monitoring & Scaling

See DEPLOYMENT_SECURITY_GUIDE.md for production monitoring setup.
