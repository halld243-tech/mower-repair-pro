# Security Implementation Guide - Deployment Ready

**Application:** Engine Repair Pro - Lawn Mower Business
**Status:** 🟢 **PRODUCTION READY (Phase 1 Complete)**
**Last Updated:** 2026-06-25

---

## Quick Start: Deploy to Azure

### Prerequisites
```bash
# 1. Fix npm vulnerabilities
npm uninstall postcss
npm audit  # Should show "no vulnerabilities"

# 2. Verify build
npm run build  # Should complete with ✓

# 3. Test locally
npm run dev
# Visit http://localhost:3000
# Verify all pages load, API endpoints work
```

### Security Checklist Before Deployment
- [x] Input validation on all API endpoints
- [x] Rate limiting middleware enabled
- [x] Security headers configured
- [x] API key authentication for admin operations
- [x] Structured logging enabled
- [x] No npm vulnerabilities
- [x] Code compiles successfully
- [ ] HTTPS certificate obtained
- [ ] Database encryption enabled
- [ ] Secrets moved to Key Vault
- [ ] WAF rules configured
- [ ] Monitoring enabled

---

## Architecture Overview

### Components
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
├──────────────────────┬──────────────────────────────────┤
│    Frontend (React)  │      Backend (API Routes)        │
├──────────────────────┼──────────────────────────────────┤
│ - Home Page          │ /api/services (GET, POST)        │
│ - Services Page      │ /api/appointments (GET, POST)    │
│ - Booking Page       │ /api/appointments/availability   │
│ - Contact Page       │ /api/contact (POST)              │
│ - Blog Page          │                                  │
└──────────────────────┴──────────────────────────────────┘
         ↓ (HTTPS)           ↓ (Validates, Sanitizes)
    ┌────────────────────────────────┐
    │   PostgreSQL Database          │
    ├────────────────────────────────┤
    │ - ServiceCategory              │
    │ - Service                      │
    │ - Appointment                  │
    │ - Customer                     │
    │ - Inquiry                      │
    │ - BlogPost                     │
    └────────────────────────────────┘
         ↓ (Encrypted)
    ┌────────────────────────────────┐
    │   Azure Storage (Backups)      │
    └────────────────────────────────┘
```

### Security Layers
```
Layer 1: Network
├─ HTTPS/TLS (encrypted in transit)
├─ WAF (Web Application Firewall)
└─ DDoS Protection

Layer 2: Application
├─ Input Validation
├─ Input Sanitization
├─ Rate Limiting
├─ API Key Authentication
└─ Security Headers

Layer 3: Data
├─ Parameterized Queries (SQL injection prevention)
├─ Database Encryption (at rest)
├─ Backup Encryption
└─ Secrets Management (Key Vault)

Layer 4: Monitoring
├─ Structured Logging
├─ Security Event Tracking
├─ Application Insights
└─ Alert Thresholds
```

---

## Configuration Reference

### Environment Variables

#### Development (.env.local)
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lawn_mower_business"

# API Security
API_KEY="dev-key-change-in-production"  # Disabled in dev mode anyway

# Email
OWNER_EMAIL="owner@enginerepairpro.com"
# SENDGRID_API_KEY=  # Not configured in dev
# RESEND_API_KEY=    # Not configured in dev

# Public Config
NEXT_PUBLIC_SITE_NAME="Engine Repair Pro"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

#### Production (Azure)
```bash
# Never commit these! Use Azure Key Vault

# Database (SQL User + Encrypted Credentials)
DATABASE_URL="postgresql://admin@server:encrypted-password@server.postgres.database.azure.com:5432/lawn_mower_business"

# API Security (Strong random key)
API_KEY="<32+ random character string from Key Vault>"

# Email APIs (from Key Vault)
SENDGRID_API_KEY="<from Key Vault>"
RESEND_API_KEY="<from Key Vault>"
OWNER_EMAIL="<verified business email>"

# Public Config
NEXT_PUBLIC_SITE_NAME="Engine Repair Pro"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Azure Specific
NEXT_PUBLIC_ENVIRONMENT="production"
```

### Rate Limiting Configuration

Location: `lib/security.ts`

```typescript
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;  // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;       // Per IP
```

**Current Settings:** 100 requests per 15 minutes per IP
**Returns:** 429 Too Many Requests when exceeded

**Recommended for Production:**
- Development: 100 req/15min (current)
- Staging: 50 req/15min
- Production: 30-50 req/15min (stricter)

### Security Headers

Location: `lib/security.ts` - `addSecurityHeaders()` function

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

---

## API Endpoints Security Summary

### GET /api/services
- ✅ Rate limited
- ✅ Input validation (categoryId sanitized)
- ✅ Security headers applied
- ❌ Authentication: None required (public endpoint)
- **Use Case:** Display services to customers

### POST /api/services
- ✅ Rate limited
- ✅ Input validation (all fields validated)
- ✅ Input sanitization
- ✅ Security headers applied
- ✅ Authentication: API key required (admin operation)
- **Use Case:** Admin creates new service

### GET /api/appointments
- ✅ Rate limited
- ✅ Security headers applied
- ⚠️ Authentication: None (CONSIDER: Add authentication to prevent data disclosure)
- ⚠️ No pagination (could leak performance data)
- **Use Case:** Display appointments (should require authentication)

### POST /api/appointments
- ✅ Rate limited
- ✅ Input validation (email, phone, name validated)
- ✅ Input sanitization
- ✅ Security headers applied
- ✅ Service existence verified
- ✅ Email confirmation sent
- ❌ Authentication: None required (public endpoint - intentional)
- **Use Case:** Customer books appointment

### GET /api/appointments/availability
- ✅ Rate limited
- ✅ Input validation (serviceId sanitized, date validated)
- ✅ Security headers applied
- ✅ Service existence verified
- ❌ Authentication: None required (public endpoint)
- **Use Case:** Check available booking slots

### POST /api/contact
- ✅ Rate limited
- ✅ Input validation (email, phone, name validated)
- ✅ Input sanitization
- ✅ Security headers applied
- ✅ Email confirmation sent
- ❌ Authentication: None required (public endpoint - intentional)
- **Use Case:** Customer submits contact form

---

## Input Validation Rules

### Email
- Format: RFC 5322 simplified regex
- Max Length: 254 characters
- Validation: `validateEmail(email)`

### Phone
- Format: E.164 international format with optional +
- Range: Must start with 1-9, total 2-15 digits
- Validation: `validatePhone(phone)`

### Name
- Max Length: 100 characters
- Characters: Letters, spaces, hyphens, apostrophes only
- Validation: `validateName(name)`

### Price
- Range: 0 to 10,000
- Type: Decimal/float
- Validation: `validatePrice(price)`

### Duration
- Range: 1 to 480 minutes (8 hours max)
- Type: Integer
- Validation: `validateDuration(duration)`

### General Strings
- Max Length: 500 characters
- Sanitization: Remove `<>\"'`
- Function: `sanitizeString(text)`

---

## Logging & Monitoring

### Security Events Logged
```
UNAUTHORIZED_ACCESS          - Failed API key validation
RATE_LIMIT_EXCEEDED         - Too many requests from IP
SERVICE_CREATED             - New service added
APPOINTMENT_CREATED         - New appointment booked
INQUIRY_CREATED             - Contact form submitted
API_ERROR                   - General API errors
APPOINTMENT_ERROR           - Appointment-specific errors
CONTACT_ERROR               - Contact form errors
AVAILABILITY_CHECKED        - Availability query
AVAILABILITY_ERROR          - Availability check failed
```

### Log Format
```json
{
  "timestamp": "2026-06-25T10:30:45.123Z",
  "event": "SERVICE_CREATED",
  "severity": "INFO",
  "serviceId": "abc123",
  "clientId": "192.168.1.1"
}
```

### Monitoring Setup (Azure)
```
1. Application Insights
   - Track page views
   - Track API calls
   - Track exceptions
   - Track performance metrics

2. Log Analytics
   - Stream security logs
   - Create custom queries
   - Set up alerts

3. Alerts
   - High error rate (>5% of requests)
   - Repeated 401 Unauthorized
   - DDoS pattern detection
   - Database connection failures
```

---

## Post-Deployment Procedures

### Day 1 After Deploy
- [ ] Verify all pages load: http://yourdomain.com/
- [ ] Test booking flow end-to-end
- [ ] Verify emails send correctly
- [ ] Check security headers: `curl -i https://yourdomain.com/api/services`
- [ ] Monitor error logs in Application Insights

### Week 1 After Deploy
- [ ] Review security event logs
- [ ] Check rate limiting is working
- [ ] Verify backups are running
- [ ] Test database failover
- [ ] Load test: Simulate 100+ concurrent users

### Month 1 After Deploy
- [ ] Monthly security audit
- [ ] Dependency updates review
- [ ] Database optimization
- [ ] Backup restoration test
- [ ] Disaster recovery drill

---

## Troubleshooting

### High 401 Unauthorized Errors
**Cause:** Incorrect API key for POST /api/services
**Fix:** 
```bash
# Check API key matches between .env and requests
echo $API_KEY
# Or use with curl
curl -X POST https://yourdomain.com/api/services \
  -H "x-api-key: $(echo $API_KEY)"
```

### 429 Too Many Requests
**Cause:** Rate limiting triggered
**Fix:**
- Wait 15 minutes for window to reset
- Check if customer/IP is making too many requests
- Adjust rate limit if legitimate high-volume usage

### Email Confirmations Not Sending
**Cause:** SendGrid/Resend API key not configured
**Fix:**
```bash
# 1. Add API key to Azure Key Vault
# 2. Update .env with correct value
# 3. Restart application
# 4. Check logs for SendGrid/Resend errors
```

### Input Validation Rejection
**Cause:** Customer data doesn't match validation rules
**Fix:**
- Email: Must be valid format (name@domain.com)
- Phone: Must be 10+ digits, may include +1
- Name: Max 100 chars, letters/spaces only
- Show error message to customer

---

## Security Maintenance Schedule

### Daily
- Monitor error logs
- Check for DDoS attempts
- Review security event logs

### Weekly
- `npm audit` check for vulnerabilities
- Review dependency updates
- Backup verification

### Monthly
- Full security audit
- Penetration testing prep
- Password/key rotation review
- Performance optimization

### Quarterly
- Penetration testing
- Security training
- Disaster recovery drill
- Compliance audit

### Annually
- Full security assessment
- Penetration testing (external)
- Security certification renewal
- Business continuity review

---

## Support & Escalation

**For Security Issues:**
1. Check NIST_OWASP_COMPLIANCE.md
2. Check NPM_VULNERABILITY_FIX.md
3. Review /lib/security.ts
4. Check individual API route files for implementation

**For Performance Issues:**
1. Check rate limiting settings
2. Review database indexes
3. Enable query logging
4. Monitor Application Insights

**For Deployment Issues:**
1. Verify .env variables set
2. Check Azure Key Vault access
3. Verify database connection
4. Check network security groups

---

## Compliance Verification

Before going to production, verify:

```bash
# 1. Build succeeds with no errors
npm run build

# 2. No npm vulnerabilities
npm audit

# 3. All security headers present
curl -i https://yourdomain.com/api/services | grep -E "^(X-|Content-Security|Strict-Transport)"

# 4. Rate limiting works
for i in {1..150}; do
  curl https://yourdomain.com/api/services > /dev/null 2>&1
done
# Should get 429 responses after 100 requests

# 5. API key required for admin operations
curl -X POST https://yourdomain.com/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","price":100,"durationMinutes":30}'
# Should return 401 Unauthorized
```

---

**For detailed security implementation, see:**
- NIST_OWASP_COMPLIANCE.md - Full compliance guide
- NPM_VULNERABILITY_FIX.md - Dependency security
- /lib/security.ts - Security middleware code
- Individual API route files - Security implementation

