# Farmease Docker Quick Reference

## 🚀 Quick Commands

### Start Everything
```bash
cd Ternak
docker-compose up -d
```

### Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger/index.html
- **Database**: localhost:5432 (psql client)

### View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
docker-compose logs -f postgres     # Database only
```

### Database Operations
```bash
# Open database shell
docker-compose exec postgres psql -U postgres -d farmease

# Backup database
docker-compose exec postgres pg_dump -U postgres farmease > backup.sql

# Run migrations
docker-compose exec backend ./farmease migrate

# Run seeders
docker-compose exec backend sh -c 'psql -U postgres -d farmease -h postgres < /app/seeders/10_comprehensive_seed.sql'
```

### Troubleshooting
```bash
# Check service status
docker-compose ps

# Check health
curl http://localhost:3000        # Frontend
curl http://localhost:8080/health # Backend
docker-compose exec postgres pg_isready

# Restart services
docker-compose restart

# Stop all
docker-compose stop

# Remove containers
docker-compose down

# Full cleanup (WARNING: Deletes database!)
docker-compose down -v
```

---

## 📁 Docker Files Explained

### 1. `docker-compose.yml` (Main Orchestration)
**Purpose**: Defines all services, networks, volumes, and configurations

**Services**:
- `postgres`: PostgreSQL 15 database
- `backend`: Go/Fiber API server
- `frontend`: Vue 3 web application

**Key Features**:
- Automatic health checks
- Volume persistence
- Service dependencies
- Environment configuration

---

### 2. `Farmease/Dockerfile` (Frontend)
**Purpose**: Build Vue 3 + Vite frontend application

**Build Process**:
1. **Stage 1 (builder)**: npm install → npm run build
2. **Stage 2 (runtime)**: Serve static files on port 3000

**Optimizations**:
- Multi-stage build reduces image size
- Frozen lockfile for reproducible builds
- Health check enabled

---

### 3. `Farmease-BE/farmease/Dockerfile` (Backend)
**Purpose**: Build Go application with Fiber framework

**Build Process**:
1. **Stage 1 (builder)**: Download deps → Generate docs → Build binary
2. **Stage 2 (runtime)**: Alpine image with non-root user

**Optimizations**:
- Multi-stage build
- Alpine Linux (minimal image)
- CGO disabled for static binary
- Non-root user (farmease:1000) for security

---

### 4. `.env.docker` (Environment Configuration)
**Purpose**: Default environment variables for docker-compose

**Default Values**:
```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=farmease
DB_PORT=5432
APP_ENV=development
BACKEND_PORT=8080
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8080
```

**To customize**: Create `.env.local` or edit `.env.docker`

---

### 5. `init-db.sh` (Database Initialization)
**Purpose**: Initialize PostgreSQL database on first run

**Functions**:
- Waits for PostgreSQL to be ready
- Checks if tables exist
- Prevents duplicate initialization errors

---

### 6. `Farmease/.dockerignore` (Frontend Build Optimization)
**Excludes from build context**:
- node_modules
- .git
- dist
- coverage
- .env files
- IDE files

**Result**: Faster builds, smaller context size

---

### 7. `Farmease-BE/.dockerignore` (Backend Build Optimization)
**Excludes from build context**:
- vendor
- .git
- tmp
- test files
- README files
- IDE files

**Result**: Faster builds, smaller context size

---

### 8. `DOCKER_SETUP.md` (Complete Guide)
**Purpose**: Comprehensive Docker documentation (600+ lines)

**Sections**:
- Prerequisites & setup
- Quick start guide
- Service documentation
- Common commands
- Troubleshooting
- Production deployment
- Monitoring & health checks

---

### 9. `docker-manage.sh` (Linux/Mac Management Script)
**Purpose**: Simplified Docker operations on Linux/Mac

**Usage**:
```bash
chmod +x docker-manage.sh
./docker-manage.sh start        # Start all services
./docker-manage.sh logs         # View logs
./docker-manage.sh status       # Check status
./docker-manage.sh migrate      # Run migrations
./docker-manage.sh seed         # Seed database
```

---

### 10. `docker-manage.bat` (Windows Management Script)
**Purpose**: Simplified Docker operations on Windows

**Usage**:
```cmd
docker-manage.bat start         # Start all services
docker-manage.bat logs          # View logs
docker-manage.bat status        # Check status
docker-manage.bat migrate       # Run migrations
docker-manage.bat seed          # Seed database
```

---

## 📊 Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Frontend    │  │   Backend    │  │ PostgreSQL│ │
│  │   (Vue 3)    │  │  (Go/Fiber)  │  │           │ │
│  │  Port 3000   │  │  Port 8080   │  │  Port5432 │ │
│  │              │  │              │  │           │ │
│  │ node:22-a    │  │ golang:1.22- │  │ postgres: │ │
│  │ lpine        │  │ alpine       │  │ 15-alpine │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                │                │          │
│         └────────────────┼────────────────┘          │
│              farmease_network (bridge)              │
│                                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   Volumes (Persistent)               │
├─────────────────────────────────────────────────────┤
│ postgres_data → /var/lib/postgresql/data            │
│ backend_logs  → /app/logs                           │
│ frontend_logs → /app/logs                           │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### User → Frontend → Backend → Database
```
1. User opens http://localhost:3000
2. Frontend (Vue) loads in browser
3. User performs action (login, create, update)
4. Frontend calls API → http://backend:8080
5. Backend processes request
6. Backend queries PostgreSQL (postgres:5432)
7. Database returns data
8. Backend returns JSON response
9. Frontend updates UI
```

### All communication through Docker network
- Frontend ↔ Backend: `http://backend:8080`
- Backend ↔ Database: `postgres:5432`
- External access: `localhost:3000`, `localhost:8080`, `localhost:5432`

---

## 🔐 Test Accounts

```
Login: admin / admin123
```

Available accounts:
- **admin** / admin123 (Full access)
- **operator_ternak** / operator123 (Livestock manager)
- **operator_perkebunan** / operator123 (Farming manager)
- **peternak1** / peternak123 (Livestock user)
- **petani1** / petani123 (Farming user)

---

## ⚠️ Important Notes

### Ports Used
- **3000** - Frontend
- **8080** - Backend API
- **5432** - PostgreSQL

Ensure these ports are available on your host machine.

### Data Persistence
- `postgres_data` volume persists database
- Removing volumes with `docker-compose down -v` **DELETES** data

### First Run
```bash
# 1. Start services
docker-compose up -d

# 2. Wait for health checks to pass
docker-compose ps

# 3. Run migrations
docker-compose exec backend ./farmease migrate

# 4. Seed database
./docker-manage.sh seed  # OR
docker-compose exec backend sh << 'EOF'
psql -U postgres -d farmease -h postgres < /app/seeders/10_comprehensive_seed.sql
psql -U postgres -d farmease -h postgres < /app/seeders/11_livestock_tracking_seed.sql
psql -U postgres -d farmease -h postgres < /app/seeders/12_gardening_comprehensive_seed.sql
EOF

# 5. Access http://localhost:3000
```

### Rebuilding Images
After code changes:
```bash
# Rebuild specific service
docker-compose build frontend    # or backend

# Rebuild and restart
docker-compose up -d --build frontend
```

---

## 📱 API Examples

### Check Backend Health
```bash
curl http://localhost:8080/health
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Get Sheep List
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/sheep
```

---

## 🚀 Performance Tips

1. **Close unused services**: Don't run all containers if not needed
2. **Monitor resources**: `docker stats`
3. **Optimize images**: Check Dockerfile multi-stage builds
4. **Use volumes**: Don't recreate containers unnecessarily
5. **Enable log rotation**: Set `log-driver` options in compose

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Ports already in use | `netstat -ano \| findstr :3000` then kill process or change port in .env.docker |
| Database won't connect | Wait longer for health check, check logs: `docker-compose logs postgres` |
| Frontend blank page | Check backend API is running: `curl http://localhost:8080/health` |
| Build fails | Clear cache: `docker-compose build --no-cache` |
| Container crashes | Check logs: `docker-compose logs <service>` |

---

## 📞 Quick Help

```bash
# See all available commands
./docker-manage.sh help         # Linux/Mac
docker-manage.bat help          # Windows

# See full documentation
cat DOCKER_SETUP.md

# Check logs for errors
docker-compose logs -f

# Restart and see status
docker-compose restart && docker-compose ps
```

---

**Happy Dockering!** 🐳

For complete documentation, see: `DOCKER_SETUP.md`
