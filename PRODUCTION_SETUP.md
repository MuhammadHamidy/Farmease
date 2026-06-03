# Production Environment Configuration for Farmease

## Environment Variables

### Frontend (.env.production)
```env
# API Configuration
VITE_API_BASE_URL=https://api.farmease.example.com

# Application
VITE_APP_NAME=Farmease
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_LOG_LEVEL=error

# Security
VITE_CSRF_TOKEN_HEADER=X-CSRF-Token
VITE_API_TIMEOUT=30000
```

### Backend (.env.production.local - NOT in git)
```env
# Database
DB_HOST=postgres.prod.example.com
DB_PORT=5432
DB_USER=farmease_prod
DB_PASSWORD=<SECURE_PASSWORD>
DB_NAME=farmease
DB_SSLMODE=require

# Server
APP_ENV=production
APP_PORT=8080
APP_DEBUG=false
APP_LOG_LEVEL=info

# JWT/Auth
JWT_SECRET=<SECURE_SECRET_KEY>
JWT_EXPIRY=24h

# CORS
CORS_ALLOWED_ORIGINS=https://farmease.example.com,https://www.farmease.example.com

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@farmease.example.com
SMTP_PASSWORD=<SECURE_PASSWORD>

# Cloud Storage (Optional)
AWS_S3_BUCKET=farmease-prod
AWS_S3_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<KEY>
AWS_SECRET_ACCESS_KEY=<SECRET>

# Monitoring
SENTRY_DSN=<SENTRY_URL>
NEW_RELIC_LICENSE_KEY=<KEY>
```

## Production Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Regenerate JWT secrets and encryption keys
- [ ] Enable HTTPS/TLS certificates (Let's Encrypt)
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable CORS for specific domains only
- [ ] Implement rate limiting
- [ ] Setup CSRF protection
- [ ] Enable security headers (HSTS, CSP, X-Frame-Options)
- [ ] Regular security updates for dependencies

### Database
- [ ] Backup current database
- [ ] Enable database encryption
- [ ] Setup automated daily backups
- [ ] Configure point-in-time recovery
- [ ] Monitor database performance
- [ ] Setup connection pooling
- [ ] Configure database replicas for HA
- [ ] Enable audit logging

### Infrastructure
- [ ] Setup load balancer
- [ ] Configure health checks
- [ ] Setup auto-scaling policies
- [ ] Configure reverse proxy (Nginx/Caddy)
- [ ] Setup CDN for static assets
- [ ] Configure log aggregation
- [ ] Setup monitoring & alerting
- [ ] Configure backup storage

### Application
- [ ] Run all tests
- [ ] Performance load testing
- [ ] Security scanning (SAST/DAST)
- [ ] Build optimization
- [ ] Minification & compression
- [ ] Tree shaking for JS bundles
- [ ] Image optimization
- [ ] Code splitting for frontend

### Monitoring & Observability
- [ ] Application performance monitoring (APM)
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Log aggregation (ELK, Splunk)
- [ ] Metrics collection (Prometheus)
- [ ] Distributed tracing (Jaeger)
- [ ] Uptime monitoring
- [ ] Real User Monitoring (RUM)

### CI/CD
- [ ] Setup automated tests
- [ ] Automated deployment pipeline
- [ ] Blue-green deployment strategy
- [ ] Canary releases
- [ ] Rollback procedures
- [ ] Deployment notifications

### Documentation
- [ ] Runbook for common operations
- [ ] Incident response procedures
- [ ] Disaster recovery plan
- [ ] System architecture diagram
- [ ] API documentation (auto-generated)
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## Production Docker Compose Setup

See: `docker-compose.prod.yml`

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Production Kubernetes Setup

See: `k8s/` directory for Kubernetes manifests

Deploy with:
```bash
kubectl apply -f k8s/
```

---

## Scaling Strategies

### Horizontal Scaling
- Run multiple backend replicas
- Load balance across instances
- Shared database (PostgreSQL)
- Shared cache layer (Redis)

### Vertical Scaling
- Increase server resources
- Database query optimization
- Caching strategy
- Connection pooling

### Database Optimization
- Index frequently queried columns
- Archive old data
- Partitioning large tables
- Read replicas for reports

---

## Monitoring & Alerting

### Key Metrics to Monitor
- API response time (p50, p95, p99)
- Error rate (5xx, 4xx)
- Database query performance
- Memory/CPU usage
- Disk usage
- Network I/O
- Active connections
- Queue depth (if applicable)

### Alert Thresholds
- API response time > 1s (warning), > 5s (critical)
- Error rate > 1% (warning), > 5% (critical)
- CPU > 80% (warning), > 95% (critical)
- Memory > 85% (warning), > 95% (critical)
- Disk > 80% (warning), > 90% (critical)

---

## Backup & Recovery

### Backup Strategy
- Daily automated PostgreSQL backups
- Backup retention: 30 days
- Weekly full backup archives (365 days)
- Test recovery quarterly

### Recovery Procedures
1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application
5. Monitor for issues

---

## Performance Optimization

### Frontend
- Enable gzip compression
- Minify CSS/JS
- Use HTTP/2
- Cache static assets (1 year)
- Dynamic CSS/JS (0 cache)
- Lazy load images
- Service Worker caching
- Optimize bundle size

### Backend
- Enable connection pooling
- Cache database queries
- Use Redis for session/cache
- Optimize N+1 queries
- Database indexes
- Query pagination
- Rate limiting per endpoint

### Network
- CDN for static assets
- Geographic distribution
- Protocol optimization
- Compression

---

## Cost Optimization

- Right-size server resources
- Use spot/reserved instances
- Automate scaling up/down
- Monitor and clean unused resources
- Optimize database indexes
- Archive old logs
- Use managed services
- Reserved capacity planning

---

## Support & SLA

- 99.9% uptime target
- P1: Response < 1h, Resolution < 4h
- P2: Response < 4h, Resolution < 24h
- P3: Response < 24h, Resolution < 5 days
- Escalation procedures
- On-call rotation

---

## References

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/tasks/run-application/run-single-instance-stateful-application/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
