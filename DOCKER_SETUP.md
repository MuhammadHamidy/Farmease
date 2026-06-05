# Farmease Docker Setup Guide

**Complete Docker Setup untuk Frontend, Backend, dan PostgreSQL**

---

## 📋 Prerequisites

Pastikan sudah install:
- Docker Desktop (v4.0+) - [Download](https://www.docker.com/products/docker-desktop)
- Docker Compose (biasanya bundled dengan Docker Desktop)
- Git

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Navigate to Project Directory
```bash
cd "c:\Kuliah\Semester 7\TA\Keperluan\Farmease\Ternak"
```

### Step 2: Configure Environment
```bash
# Copy environment file
cp .env.docker .env.local

# Optional: Edit .env.docker jika perlu konfigurasi berbeda
# nano .env.docker
```

### Step 3: Build & Start Containers
```bash
# Build images dan start semua services
docker-compose up -d

# Output akan menunjukkan:
# Creating farmease_postgres ... done
# Creating farmease_backend ... done
# Creating farmease_frontend ... done
```

### Step 4: Wait for Services to Start
```bash
# Check status
docker-compose ps

# Expected output:
# NAME                    STATUS              PORTS
# farmease_postgres       Up 2 minutes        5432/tcp
# farmease_backend        Up 1 minute         0.0.0.0:8080->8080/tcp
# farmease_frontend       Up 30 seconds       0.0.0.0:3000->3000/tcp
```

### Step 5: Run Migrations & Seeders
```bash
# Exec migration di backend container
docker-compose exec backend ./farmease migrate

# Run seeders (menggunakan helper script)
# Windows:
docker-manage.bat seed

# Linux/macOS:
./docker-manage.sh seed

# ATAU secara manual di dalam container backend:
docker-compose exec backend sh -c 'for file in auth.sql farms.sql cages.sql sheep.sql breedings.sql feeds.sql healths.sql manures.sql notifications.sql tasks.sql weights.sql; do echo "Running $file..."; psql "$APP_POSTGRES_URL" -f "/app/seeders/$file" || exit 1; done'
```

### Step 6: Access Applications

Open browser dan kunjungi:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/swagger/index.html
- **PostgreSQL**: localhost:5432

---

## 🔧 Docker Compose Services

### 1. PostgreSQL Database
```yaml
Service: postgres
Image: postgres:15-alpine
Port: 5432
Volume: postgres_data (persistent)
Status: Healthy when ready
```

**Default Credentials:**
- Username: `postgres`
- Password: `postgres`
- Database: `farmease`

### 2. Backend (Go + Fiber)
```yaml
Service: backend
Build: Farmease-BE/farmease/Dockerfile
Port: 8080
Depends on: postgres (health check)
Volume: config & logs
```

**Features:**
- Multi-stage build untuk optimized image
- Health check setiap 30 detik
- Non-root user untuk security
- Auto-restart on failure

### 3. Frontend (Vue 3 + Vite)
```yaml
Service: frontend
Build: Farmease/Dockerfile
Port: 3000
Depends on: backend
```

**Features:**
- Multi-stage build
- Serve static files dengan `serve`
- Health check setiap 30 detik
- Auto-restart on failure

---

## 📁 File Structure

```
Ternak/
├── docker-compose.yml           # Orchestration file
├── .env.docker                  # Environment template
├── init-db.sh                   # Database initialization script
├── Farmease/
│   ├── Dockerfile               # FE Docker image
│   ├── .dockerignore           # FE exclude files
│   ├── package.json
│   └── ...
└── Farmease-BE/
    ├── .dockerignore           # BE exclude files
    └── farmease/
        ├── Dockerfile           # BE Docker image
        ├── config/
        ├── migrations/
        ├── seeders/
        └── main.go
```

---

## 🎯 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last N lines
docker-compose logs --tail=50 backend
```

### Execute Commands in Container
```bash
# Backend shell
docker-compose exec backend sh

# Run Go commands
docker-compose exec backend ./farmease serve
docker-compose exec backend ./farmease migrate

# Database commands
docker-compose exec postgres psql -U postgres -d farmease

# Frontend shell
docker-compose exec frontend sh
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop and start
docker-compose stop
docker-compose start
```

### Database Operations
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d farmease

# Backup database
docker-compose exec postgres pg_dump -U postgres farmease > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d farmease < backup.sql

# Reset database (remove all data)
docker-compose exec postgres psql -U postgres -c "DROP DATABASE farmease; CREATE DATABASE farmease;"
```

### View Container Resource Usage
```bash
docker stats
```

### Clean Up
```bash
# Stop all containers
docker-compose down

# Remove volumes too (DELETE DATA!)
docker-compose down -v

# Remove unused images
docker image prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🌐 Network Configuration

### Internal Service Communication (Docker Network)
```
frontend (port 3000)
    ↓
backend (port 8080)
    ↓
postgres (port 5432)
```

All services berkomunikasi melalui `farmease_network`:
- Frontend → Backend: `http://backend:8080` (internal)
- Backend → Database: `postgres:5432` (internal)

### Access from Host Machine
```
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Database: localhost:5432
```

### Environment Variables
```
# Internal (container to container)
VITE_API_BASE_URL=http://backend:8080  # Used inside container

# External (host machine)
VITE_API_BASE_URL=http://localhost:8080  # Used in browser

# Configured in docker-compose.yml
DB_HOST=postgres  # Internal name
```

---

## 🔐 Security Considerations

### Current Setup (Development)
- CORS enabled for all origins (`*`)
- Database password: `postgres` (default)
- No SSL/TLS certificates

### Production Setup
```bash
# 1. Update environment variables in .env.docker
DB_PASSWORD=<strong_random_password>
CORS_ALLOWED_ORIGINS=https://yourdomain.com
APP_ENV=production
APP_DEBUG=false

# 2. Update docker-compose.yml
# - Remove localhost bindings (use reverse proxy)
# - Configure SSL certificates
# - Use secrets management

# 3. Run containers
docker-compose up -d

# 4. Verify security
docker-compose exec backend ./farmease health
```

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check port availability
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Kill existing processes and restart
docker-compose down
docker-compose up -d
```

### Database connection error
```bash
# Check if postgres is ready
docker-compose exec postgres pg_isready

# Check credentials
docker-compose exec postgres psql -U postgres -c "\l"

# Reset postgres
docker-compose down -v  # CAUTION: Deletes database!
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE farmease;"
```

### Backend can't connect to database
```bash
# Verify backend logs
docker-compose logs backend

# Check database status
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Restart backend
docker-compose restart backend
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Check if served correctly
docker exec farmease_frontend ls -la /app/dist

# Verify backend is accessible from frontend
docker-compose exec frontend wget -O - http://backend:8080/health
```

### Performance issues
```bash
# Monitor resource usage
docker stats

# Check disk space
docker system df

# Reduce log verbosity
# Edit docker-compose.yml environment

# Check database query performance
docker-compose exec postgres psql -U postgres -d farmease
# \timing on
# <run queries>
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints
```bash
# Backend
curl http://localhost:8080/health

# Frontend
curl http://localhost:3000

# Database
docker-compose exec postgres pg_isready
```

### View Service Status
```bash
docker-compose ps

# Detailed view
docker inspect farmease_backend
docker inspect farmease_frontend
docker inspect farmease_postgres
```

---

## 🔄 Updating Code

### Frontend Changes
```bash
# 1. Make changes to code
# vim Farmease/src/...

# 2. Rebuild frontend image
docker-compose build frontend

# 3. Restart frontend service
docker-compose up -d frontend
```

### Backend Changes
```bash
# 1. Make changes to code
# vim Farmease-BE/farmease/cmd/...

# 2. Rebuild backend image
docker-compose build backend

# 3. Restart backend service
docker-compose up -d backend
```

### Database Schema Changes
```bash
# 1. Create new migration file in Farmease-BE/farmease/migrations/

# 2. Run migrations
docker-compose exec backend ./farmease migrate

# 3. Verify
docker-compose exec postgres psql -U postgres -d farmease -c "\d"
```

---

## 📦 Volumes & Persistence

### What's Persisted
```yaml
postgres_data:      # Database files (persistent)
backend_logs:       # Backend application logs
frontend_logs:      # Frontend logs
config:             # Backend configuration (read-only)
```

### Backup Data
```bash
# Backup database volume
docker run --rm -v farmease_postgres_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .

# Backup application logs
docker cp farmease_backend:/app/logs ./backend-logs-backup
```

---

## 🚀 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml farmease

# View services
docker service ls

# Scale services
docker service scale farmease_backend=3 farmease_frontend=2
```

### Using Kubernetes
See `k8s-manifests/` directory for Kubernetes YAML files.

### Cloud Deployment
- **AWS**: Push to ECR, use ECS/Fargate
- **Google Cloud**: Push to GCR, use Cloud Run
- **Azure**: Push to ACR, use Container Instances
- **DigitalOcean**: Use App Platform
- **Heroku**: Use Container Registry

---

## 📝 Example: Complete Workflow

```bash
# 1. Clone/Navigate to project
cd Ternak

# 2. Setup environment
cp .env.docker .env.local

# 3. Build and start
docker-compose up -d --build

# 4. Wait for services (check health)
docker-compose ps

# 5. Run migrations
docker-compose exec backend ./farmease migrate

# 6. Seed database
# Windows: docker-manage.bat seed
# Linux/macOS: ./docker-manage.sh seed
# ATAU manual:
docker-compose exec backend sh -c 'for file in auth.sql farms.sql cages.sql sheep.sql breedings.sql feeds.sql healths.sql manures.sql notifications.sql tasks.sql weights.sql; do psql "$APP_POSTGRES_URL" -f "/app/seeders/$file" || exit 1; done'

# 7. Verify everything works
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# API Docs: http://localhost:8080/swagger/index.html

# 8. Login with test account
# Username: admin
# Password: admin123

# 9. View logs
docker-compose logs -f

# 10. Stop when done
docker-compose down
```

---

## 🎓 Learning Resources

### Docker Documentation
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### Tutorials
- [Docker for Beginners](https://docker-curriculum.com/)
- [Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)

---

## ✅ Checklist

Before production:
- [ ] Change default database password
- [ ] Configure CORS for specific domains
- [ ] Enable SSL/TLS certificates
- [ ] Setup backup strategy
- [ ] Configure logging/monitoring
- [ ] Test failover scenarios
- [ ] Document deployment process
- [ ] Setup CI/CD pipeline
- [ ] Performance load testing
- [ ] Security audit

---

## 📞 Support

Untuk masalah:
1. Check logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Check documentation: `INTEGRATION_GUIDE.md`
4. Reset everything: `docker-compose down -v && docker-compose up -d`

---

**Docker Setup Complete!** 🐳

Semua services dapat diakses:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432
