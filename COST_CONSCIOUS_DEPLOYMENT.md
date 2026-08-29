# Cost-Conscious Azure Deployment Guide

## Budget Overview
**Monthly Target: $25-35** for Engine Repair Pro on Azure

## Resource Sizing Decisions

### Container App
- **CPU**: 0.25 vCPU (¼ of standard) - sufficient for small lawn care business
- **Memory**: 512 MB (½ of standard) - Next.js runs efficiently with this
- **Replicas**: 1 fixed (no scaling) - prevents cost overruns
- **Cost**: ~$5-7/month

✅ This handles moderate traffic (100s of requests/day)  
⚠️ If traffic spikes unexpectedly, response times may slow (not crash)

### PostgreSQL Database
- **Tier**: Burstable (B1s) - cheapest option with acceptable performance
- **Compute**: 1 vCore burstable
- **Storage**: 20 GB (auto-scales)
- **Backup**: 7-day retention (included)
- **Cost**: ~$15-20/month

✅ Handles 100+ concurrent connections  
✅ Suitable for booking/inquiry workloads

### Container Registry
- **Tier**: Basic - only $5/month
- **Storage**: 10 GB included per image
- **Cost**: ~$5/month

✅ Sufficient for 1 application image

## Monthly Cost Breakdown

| Component | Quantity | Unit Cost | Monthly |
|-----------|----------|-----------|---------|
| Container App | 730 hours | $0.008/hr | $5.84 |
| PostgreSQL B1s | 1 server | $15-20 | $15-20 |
| Container Registry | 1 registry | $5 | $5 |
| Data Transfer (egress) | ~10 GB | $0.087/GB | ~$0.87 |
| **TOTAL** | | | **$27-32** |

## Cost Reduction Strategies

### 1. Stop App When Not Needed
If the business is closed certain hours/days:
```bash
# Stop the app (database keeps running)
az containerapp stop -g $RESOURCE_GROUP -n $CONTAINER_APP_NAME

# Resume later
az containerapp start -g $RESOURCE_GROUP -n $CONTAINER_APP_NAME
```
**Savings**: Up to 30% if offline 8+ hours/day

### 2. Right-Size Database
Current: 20 GB auto-scaling storage
```bash
# If using < 10 GB after 3 months:
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --storage-size 32
```

### 3. Monitor & Alert
```bash
# Set up billing alerts in Azure Portal
# Budget → New budget → Set $40 limit → Alert at 80%
```

### 4. Delete Unused Resources
```bash
# Clean up if no longer needed
az group delete \
  --resource-group $RESOURCE_GROUP \
  --yes --no-wait
```

### 5. Schedule Database Backups
Current: 7-day retention (default)
- Reduce to 1-day if acceptable: **Save $2-3/month**
```bash
# Backup retention is set per-server (UI or CLI)
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --backup-retention 1
```

## Alternative Cheaper Options

### Option A: App Service (Linux)
**Cost**: ~$10-15/month (Standard B1)
```bash
# Create App Service Plan
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Deploy container to App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_NAME \
  --deployment-container-image-name $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
```
**Pros**: $5-10/month cheaper than Container Apps  
**Cons**: Less modern architecture

### Option B: PostgreSQL Single Server (Deprecated)
**Cost**: ~$10-15/month (General Purpose tier)
⚠️ Deprecated - not recommended for new projects  
❌ Microsoft will retire this by 2025

### Option C: Combo (App Service + Single Server)
**Total**: ~$20-30/month
- Good for tight budgets
- But Single Server is deprecated

## Monitoring Costs

### Azure Cost Management Portal
1. Go to Azure Portal → Cost Management + Billing
2. Create budget: Set $40/month limit
3. Set alerts: Notify at 80% and 100%
4. Analyze costs by resource group

### CLI Cost Query
```bash
# Get current month costs
az costmanagement query create \
  --scope "/subscriptions/{subscription-id}" \
  --timeframe "MonthToDate" \
  --type "Usage"
```

## Performance Under Load

With current sizing (0.25 CPU, 512 MB):

| Metric | Expected | Limits |
|--------|----------|--------|
| Concurrent connections | 50-100 | 200+ |
| Requests/sec | 10-20 | 50+ |
| Response time | <500ms | >2s when overloaded |
| Uptime SLA | 99.5%+ | No SLA guarantee |

**If you exceed limits**: Upgrade to 0.5 CPU = **+$5/month**

## Scaling Up When Ready

If business grows and budget allows:

```bash
# Scale to medium
az containerapp update \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_APP_NAME \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 1 \
  --max-replicas 2

# Cost increase: +$10/month

# Upgrade database
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --sku-name Standard_D2s_v3

# Cost increase: +$40-50/month
```

## Cost-Saving Checklist

- [ ] Deployed with 0.25 CPU, 512 MB (not 0.5 CPU, 1 GB)
- [ ] Replicas set to 1 min/max (no auto-scaling)
- [ ] Using Burstable PostgreSQL tier
- [ ] Database backup retention set to 7 days
- [ ] Billing alerts configured in Azure Portal
- [ ] Understand when to scale if needed
- [ ] Have deletion plan for unused resources
- [ ] Monitor costs weekly first month

## Support & Escalation

**If costs exceed budget**:
1. Check Azure Cost Management for unexpected charges
2. Delete unused resource groups immediately
3. Scale down app or database
4. Consider switching to App Service if cheaper

**If app is too slow**:
1. Check Container App logs for errors
2. Monitor CPU/memory usage
3. Upgrade to 0.5 CPU tier
4. Add caching layer (Redis - adds ~$20/month)

## Questions?

See DEPLOY_TO_ACA.md for full deployment guide.
See SECURITY_IMPLEMENTATION_SUMMARY.md for security overview.
