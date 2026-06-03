# Farmease Production Deployment Guide

**Complete guide for deploying Farmease to production environments**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Preparation](#database-preparation)
4. [SSL/TLS Certificate](#ssltls-certificate)
5. [Docker Deployment](#docker-deployment)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code & Build
- [ ] All tests passing (`npm run test:e2e`)
- [ ] Security scan completed
- [ ] Dependencies updated and audited (`npm audit`)
- [ ] Build optimized (`npm run build`)
- [ ] Environment variables documented
- [ ] API documentation generated

### Infrastructure
- [ ] Server provisioned (2+ instances for HA)
- [ ] Database server ready
- [ ] SSL certificates obtained
- [ ] DNS records updated
- [ ] Load balancer configured
- [ ] Backup storage available
- [ ] CDN configured (if applicable)

### Security
- [ ] Security audit completed
- [ ] Secrets management ready (HashiCorp Vault, AWS Secrets Manager, etc.)
- [ ] CORS configured correctly
- [ ] CSP headers configured
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] WAF rules configured

### Monitoring
- [ ] APM tool configured (New Relic, DataDog, etc.)
- [ ] Error tracking configured (Sentry)
- [ ] Log aggregation ready (ELK, Splunk)
- [ ] Alert rules created
- [ ] Dashboards created
- [ ] On-call rotation established

---

## Infrastructure Setup

### Recommended Setup
```
┌─────────────────────────────────────────┐
│         Internet / CloudFlare           │
└────────────────────┬────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Load Balancer (HA)    │
        │   (AWS ALB / Nginx)     │
        └────────────┬────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   ┌──▼──┐       ┌──▼──┐       ┌──▼──┐
   │App1 │       │App2 │       │App3 │
   │ + FE│       │ + FE│       │ + FE│
   └──┬──┘       └──┬──┘       └──┬──┘
      │              │              │
      └──────────────┼──────────────┘
                     │
        ┌────────────▼────────────┐
        │   PostgreSQL Primary    │
        │    + Replication       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   Backup Storage        │
        │  (S3, GCS, Azure)       │
        └────────────────────────┘
```

### Server Requirements

**Frontend/Backend Container:**
- CPU: 2 vCPU (minimum), 4 vCPU (recommended)
- RAM: 2GB (minimum), 4GB (recommended)
- Storage: 20GB SSD
- OS: Ubuntu 20.04 LTS or later

**Database Server:**
- CPU: 4 vCPU (minimum)
- RAM: 8GB (minimum)
- Storage: 100GB SSD (grows with data)
- OS: Ubuntu 20.04 LTS or later

**Load Balancer:**
- AWS ALB or Nginx on separate instance
- Same region as app servers

---

## Database Preparation

### 1. Create Databases & Users

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE farmease;

# Create user
CREATE USER farmease_prod WITH PASSWORD 'SECURE_PASSWORD_HERE';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE farmease TO farmease_prod;

# Connect to database and grant schema privileges
\c farmease
GRANT ALL PRIVILEGES ON SCHEMA public TO farmease_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO farmease_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO farmease_prod;
```

### 2. Run Migrations

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml exec backend ./farmease migrate

# Or manually
psql -U farmease_prod -d farmease -h localhost < migrations/001_init.sql
```

### 3. Seed Initial Data

```bash
docker-compose -f docker-compose.prod.yml exec backend sh << 'EOF'
psql -U farmease_prod -d farmease -h postgres << 'SQL'
-- Users
INSERT INTO auth.roles (id, name) VALUES (1, 'admin'), (2, 'operator'), (3, 'user');
INSERT INTO auth.accounts (id, username, password, role_id) VALUES 
  (1, 'admin', crypt('admin123', gen_salt('bf')), 1);
-- Farms
INSERT INTO master.farms (id, name, location) VALUES (1, 'Farm Utama', 'Bandung');
-- More seeding...
SQL
EOF
```

### 4. Setup Backups

```bash
# Create backup script
cat > /opt/backup-farmease.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/farmease"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="farmease"
DB_USER="farmease_prod"
DB_HOST="localhost"

# Backup
pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > $BACKUP_DIR/farmease_$TIMESTAMP.sql.gz

# Keep only 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: farmease_$TIMESTAMP.sql.gz"
EOF

chmod +x /opt/backup-farmease.sh

# Setup cron job (daily at 2 AM)
echo "0 2 * * * /opt/backup-farmease.sh" | crontab -
```

---

## SSL/TLS Certificate

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone \
  -d farmease.example.com \
  -d www.farmease.example.com \
  --email admin@example.com \
  --agree-tos

# Certificates will be at:
# /etc/letsencrypt/live/farmease.example.com/

# Copy to Docker volume or mount
sudo cp -r /etc/letsencrypt/live/farmease.example.com /path/to/nginx/ssl/

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Using Commercial Certificate

```bash
# Place certificate files in nginx/ssl/:
# - fullchain.pem (certificate + intermediates)
# - privkey.pem (private key)
```

---

## Docker Deployment

### Production Environment File

Create `.env.docker.prod`:
```env
# Database
DB_USER=farmease_prod
DB_PASSWORD=<SECURE_PASSWORD>
DB_NAME=farmease
DB_PORT=5432

# Backend
APP_ENV=production
APP_DEBUG=false
BACKEND_PORT=8080

# Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=https://api.farmease.example.com

# Security
JWT_SECRET=<GENERATE_SECURE_SECRET>
JWT_EXPIRY=24h
REDIS_PASSWORD=<SECURE_PASSWORD>

# CORS
CORS_ALLOWED_ORIGINS=https://farmease.example.com,https://www.farmease.example.com

# Monitoring
SENTRY_DSN=https://key@sentry.io/project
NEW_RELIC_LICENSE_KEY=<KEY>
```

### Deploy

```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker-compose -f docker-compose.prod.yml build

# 3. Pull images (if using registry)
docker-compose -f docker-compose.prod.yml pull

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify services
docker-compose -f docker-compose.prod.yml ps

# 6. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Scaling

```bash
# Scale backend instances
docker service scale farmease_backend=3

# Check load
docker stats
```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or self-managed)
- kubectl configured
- Helm (optional but recommended)

### Using Helm Chart

```bash
# Add Farmease helm repo
helm repo add farmease https://charts.farmease.example.com
helm repo update

# Create namespace
kubectl create namespace farmease-prod

# Create secrets
kubectl create secret generic farmease-secrets \
  --from-literal=db-password=<PASSWORD> \
  --from-literal=jwt-secret=<SECRET> \
  -n farmease-prod

# Install
helm install farmease farmease/farmease \
  --namespace farmease-prod \
  --values values-prod.yaml

# Verify
kubectl get all -n farmease-prod
```

### Manual Kubernetes Deployment

See `k8s/` directory for manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/nginx.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Frontend
curl https://farmease.example.com/

# Backend API
curl https://api.farmease.example.com/health

# Database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Services
docker-compose -f docker-compose.prod.yml ps
```

### Functional Tests

```bash
# Run E2E tests against production
VITE_API_BASE_URL=https://api.farmease.example.com \
  npm run test:e2e

# Run smoke tests
curl -X POST https://api.farmease.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Performance Baseline

```bash
# Load test (10 concurrent users, 100 requests)
ab -n 100 -c 10 https://farmease.example.com/

# API endpoint test
ab -n 100 -c 10 https://api.farmease.example.com/api/sheep
```

### Security Verification

```bash
# SSL test
curl -v https://farmease.example.com/

# Check headers
curl -I https://farmease.example.com/

# OWASP scan (using OWASP ZAP)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://farmease.example.com
```

---

## Monitoring & Maintenance

### Daily Tasks
- [ ] Check error rate (< 1%)
- [ ] Check response time (p99 < 1s)
- [ ] Review logs for warnings/errors
- [ ] Verify backups completed

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check disk usage
- [ ] Update dependencies (security patches)
- [ ] Test backup restoration

### Monthly Tasks
- [ ] Database optimization/analysis
- [ ] Review access logs
- [ ] Security audit
- [ ] Capacity planning
- [ ] Update SSL certificate (30 days before expiry)

### Alerting Thresholds

```
Critical (Immediate Action Required):
- API error rate > 5%
- Response time p99 > 5s
- CPU usage > 95%
- Disk usage > 90%
- Database connection pool exhausted

Warning (Investigate):
- API error rate > 1%
- Response time p99 > 1s
- CPU usage > 80%
- Disk usage > 75%
- Memory usage > 85%
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs postgres

# Check networking
docker network ls
docker network inspect farmease_network

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Error

```bash
# Test connection
docker-compose -f docker-compose.prod.yml exec backend \
  psql -U farmease_prod -h postgres -c "SELECT version();"

# Check credentials
echo $DB_PASSWORD
echo $DB_USER

# View logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Check process memory
docker-compose -f docker-compose.prod.yml exec backend ps aux

# Restart container
docker-compose -f docker-compose.prod.yml restart backend

# Check for memory leaks
docker-compose -f docker-compose.prod.yml logs backend | grep -i memory
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Check certificate dates
openssl x509 -in nginx/ssl/fullchain.pem -noout -dates

# Renew certificate
sudo certbot renew --force-renewal
```

---

## Rollback Procedures

### Rollback to Previous Version

```bash
# 1. Get previous version tag
docker images | grep farmease

# 2. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 3. Update images to previous version
# Edit docker-compose.prod.yml to use previous tag

# 4. Start previous version
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
docker-compose -f docker-compose.prod.yml ps

# 6. Test
curl https://farmease.example.com/
```

### Database Rollback

```bash
# 1. List available backups
ls -la /backups/farmease/

# 2. Stop application
docker-compose -f docker-compose.prod.yml stop backend frontend

# 3. Restore backup
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U farmease_prod farmease < /backup/farmease_2024xxxx_xxxxxx.sql.gz

# 4. Verify data
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U farmease_prod farmease -c "SELECT COUNT(*) FROM master.farms;"

# 5. Restart application
docker-compose -f docker-compose.prod.yml start backend frontend
```

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): < 1 hour
### RPO (Recovery Point Objective): < 15 minutes

### Procedures

1. **Database Failure**
   - Activate read replica (1-5 min)
   - Restore from backup (15-30 min)

2. **Application Crash**
   - Automatic restart (< 1 min)
   - Manual restart if needed (1-5 min)
   - Rollback if bugs (5-15 min)

3. **Infrastructure Failure**
   - Auto-scaling replaces failed instance (2-5 min)
   - Manual intervention if multiple failures (30-60 min)

4. **Complete Data Loss**
   - Restore from backup (15-60 min)
   - Replay transaction logs if available (1-30 min)

---

## Performance Optimization

### Database Query Optimization
- Index frequently queried columns
- Regular VACUUM and ANALYZE
- Query plan analysis (EXPLAIN)
- Connection pooling (PgBouncer)

### Caching Strategy
- Redis for session storage
- Nginx cache for static assets
- API response caching (5-10 min)
- Browser cache (1 year for versioned assets)

### Application Optimization
- Bundle size reduction
- Code splitting
- Lazy loading
- Service Worker caching

---

## Support & Contact

- **On-Call**: +62 XXX-XXX-XXXX
- **Email**: support@farmease.example.com
- **Slack**: #farmease-ops
- **Status Page**: https://status.farmease.example.com

---

**Last Updated**: June 2026
**Next Review**: July 2026
