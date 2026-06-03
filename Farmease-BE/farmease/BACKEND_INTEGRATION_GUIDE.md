# Farmease Backend Integration & Seeding Guide

**Last Updated**: January 2025  
**Backend Status**: Ready for Integration  
**Database**: PostgreSQL  
**API Framework**: Fiber (Go)  

---

## 📋 Backend Architecture

### Module Structure
```
farmease/module/
├── auth/              # Authentication & Authorization
├── users/             # User Management
├── roles/             # Role-Based Access Control
├── farms/             # Organization Management
├── cages/             # Livestock Enclosures
├── sheep/             # Sheep Inventory
├── weights/           # Weight Tracking
├── healths/           # Health Records
├── feeds/             # Feed Management
├── manures/           # Manure Collection
├── breedings/         # Mating & Genealogy
├── pregnancies/       # Pregnancy & Birth
├── tasks/             # Operational Tasks
├── notifications/     # System Notifications
├── lahan/             # Land Management
├── pohon/             # Tree Data
├── aktivitas/         # Agricultural Activities
├── perawatan/         # Tree Care
├── pemangkasan/       # Pruning Records
├── panen/             # Harvest Records
├── akun_lahan/        # Account-Land Assignment
├── pengingat_jadwal/  # Schedule Reminders
├── notifikasi/        # Gardening Notifications
└── status_aktivitas/  # Activity Status
```

### Database Schemas (7 total)
1. **auth** - Authentication & roles
2. **master** - Core entities
3. **livestock** - Sheep and related data
4. **breeding** - Mating & reproduction
5. **logistics** - Feeds & manures
6. **operations** - Tasks & notifications
7. **gardening** - Agricultural management

---

## 🚀 Setup & Deployment

### 1. Database Setup

**Create Database**
```bash
psql -U postgres
CREATE DATABASE farmease;
```

**Run Migrations**
```bash
cd farmease
go run main.go migrate

# Output should show:
# Migration 20260516000005_create_farms_table
# Migration 20260516000010_create_roles_table
# ... (all migrations executed)
```

### 2. Seed Database

**Execute Seeders in Order**
```bash
# Comprehensive core data
psql -U postgres -d farmease < seeders/10_comprehensive_seed.sql

# Livestock tracking data
psql -U postgres -d farmease < seeders/11_livestock_tracking_seed.sql

# Gardening data
psql -U postgres -d farmease < seeders/12_gardening_comprehensive_seed.sql

# Output should show:
# INSERT 0 X
# SELECT 1
# (indicating successful inserts and sequence updates)
```

### 3. Start Backend Server

```bash
cd farmease
go run main.go serve

# Output should show:
# [INFO] Starting server on :8080
# [INFO] CORS enabled for all origins
# [INFO] All modules registered
# Server ready at http://localhost:8080
```

---

## 📊 Seeder Files Explained

### 10_comprehensive_seed.sql
**Contains:**
- Authentication (5 users with different roles)
- Farms (3 farm records)
- Sheep Types (3 types: Garut, Texel, Merino)
- Cages (6 enclosures)
- Sheep Generation 1-3 (12 sheep with genealogy)

**Purpose:** Core entity setup for livestock management

### 11_livestock_tracking_seed.sql
**Contains:**
- Health Records (7 records)
- Weight History (12 records)
- Feeds (7 feed types with stock levels)
- Feeding History (15 feeding records)
- Manure Records (8 records)
- Mating Records (4 records)
- Pregnancies (3 records)
- Births (1 record)

**Purpose:** Complete livestock tracking data

### 12_gardening_comprehensive_seed.sql
**Contains:**
- Lands (5 plots)
- Trees (10 trees: kopi, cokelat, teh)
- Activities (5 agricultural tasks)
- Care Records (7 maintenance logs)
- Pruning Records (4 records)
- Harvest Records (7 harvest entries)
- Account-Land Assignments (7 access records)
- Schedule Reminders (5 recurring tasks)
- Notifications (5 system alerts)
- Activity Status Types (5 status categories)

**Purpose:** Complete gardening/plantation data

---

## 🔑 Test Accounts

All accounts have default passwords for testing:

| ID | Username | Password | Role | Access |
|----|----------|----------|------|--------|
| 1 | admin | admin123 | Admin | All Modules |
| 2 | operator_ternak | operator123 | Operator Ternak | Livestock Only |
| 3 | operator_perkebunan | operator123 | Operator Perkebunan | Gardening Only |
| 4 | peternak1 | peternak123 | Peternak | Livestock |
| 5 | petani1 | petani123 | Petani | Gardening |

**Important:** Change passwords before production!

---

## 🔗 Complete API Endpoints

### Authentication (6 endpoints)
```
POST   /api/auth/login              # User login
POST   /api/auth/login-operator     # Operator login
GET    /api/accounts                # List accounts
POST   /api/accounts                # Create account
GET    /api/roles                   # List roles
GET    /api/roles/:id               # Get role details
```

### Livestock - Sheep (13 endpoints)
```
GET    /api/sheep                   # List all sheep
POST   /api/sheep                   # Register sheep
GET    /api/sheep/:id               # Get sheep details
PUT    /api/sheep/:id               # Update sheep
PATCH  /api/sheep/:id/status        # Update status
GET    /api/sheep/:id/genealogy     # Get genealogy
GET    /api/sheep/:id/silsilah      # Get genealogy (ID)

GET    /api/domba                   # (Indonesian) List sheep
POST   /api/domba                   # (Indonesian) Register
GET    /api/domba/:id               # (Indonesian) Get details
PUT    /api/domba/:id               # (Indonesian) Update
PATCH  /api/domba/:id/status        # (Indonesian) Update status
GET    /api/domba/:id/genealogy     # (Indonesian) Genealogy
GET    /api/domba/:id/silsilah      # (Indonesian) Genealogy
```

### Livestock - Health (6 endpoints)
```
GET    /api/sheep/:id/health        # Get health history
POST   /api/sheep/:id/health        # Record health
GET    /api/healths                 # List all health records
PUT    /api/healths/:id             # Update health record
GET    /api/kesehatan               # (ID) List
PUT    /api/kesehatan/:id           # (ID) Update
```

### Livestock - Weight (4 endpoints)
```
GET    /api/sheep/:id/weight        # Get weight history
POST   /api/sheep/:id/weight        # Record weight
GET    /api/weights                 # List all weights
GET    /api/berat-badan             # (ID) List weights
```

### Livestock - Feeds (10 endpoints)
```
GET    /api/feeds                   # List master feeds
POST   /api/feeds                   # Add feed type
PATCH  /api/feeds/:id/stock         # Update stock
PATCH  /api/feeds/:id/stok          # (ID) Update stock
GET    /api/sheep/:id/feedings      # Get feeding history
POST   /api/sheep/:id/feedings      # Record feeding
GET    /api/sheep/:id/pemberian-pakan  # (ID) History
POST   /api/sheep/:id/pemberian-pakan  # (ID) Record
GET    /api/feedings                # List all feedings
GET    /api/pakan/master            # (ID) List feeds
```

### Livestock - Manure (4 endpoints)
```
GET    /api/sheep/:id/manures       # Get manure history
POST   /api/sheep/:id/manures       # Record manure
GET    /api/manures                 # List all manures
GET    /api/kotoran                 # (ID) List manures
```

### Livestock - Breeding (6 endpoints)
```
POST   /api/matings/check-inbreeding    # Check inbreeding
POST   /api/perkawinan/cek-inbreeding   # (ID) Check inbreeding
GET    /api/matings                     # List matings
POST   /api/matings                     # Record mating
GET    /api/matings/:id                 # Get mating detail
PATCH  /api/matings/:id/status          # Update status
```

### Livestock - Pregnancy & Birth (5 endpoints)
```
POST   /api/pregnancies             # Record pregnancy
GET    /api/pregnancies             # List pregnancies
PATCH  /api/pregnancies/:id/status  # Update status
POST   /api/births                  # Record birth
GET    /api/births                  # List births
```

### Livestock - Cages (5 endpoints)
```
GET    /api/cages                   # List cages
POST   /api/cages                   # Create cage
GET    /api/cages/:id               # Get cage details
PUT    /api/cages/:id               # Update cage
DELETE /api/cages/:id               # Delete cage
```

### Livestock - Farms (5 endpoints)
```
GET    /api/farms                   # List farms
POST   /api/farms                   # Create farm
GET    /api/farms/:id               # Get farm details
PUT    /api/farms/:id               # Update farm
DELETE /api/farms/:id               # Delete farm
```

### Livestock - Tasks (3 endpoints)
```
GET    /api/tasks                   # Get user tasks
POST   /api/tasks                   # Create task
PATCH  /api/tasks/:id/complete      # Mark complete
```

### Livestock - Notifications (2 endpoints)
```
GET    /api/notifications           # Get notifications
PATCH  /api/notifications/:id/read  # Mark read
```

### Gardening - Lands (5 endpoints)
```
GET    /api/v1/lahan                # List lands
POST   /api/v1/lahan                # Create land
GET    /api/v1/lahan/:id            # Get land details
PUT    /api/v1/lahan/:id            # Update land
DELETE /api/v1/lahan/:id            # Delete land
```

### Gardening - Trees (5 endpoints)
```
GET    /api/v1/pohon                # List trees
POST   /api/v1/pohon                # Create tree
GET    /api/v1/pohon/:id            # Get tree details
PUT    /api/v1/pohon/:id            # Update tree
DELETE /api/v1/pohon/:id            # Delete tree
```

### Gardening - Activities (5 endpoints)
```
GET    /api/v1/aktivitas            # List activities
POST   /api/v1/aktivitas            # Create activity
GET    /api/v1/aktivitas/:id        # Get details
PUT    /api/v1/aktivitas/:id        # Update activity
DELETE /api/v1/aktivitas/:id        # Delete activity
```

### Gardening - Care (5 endpoints)
```
GET    /api/v1/perawatan            # List care records
POST   /api/v1/perawatan            # Create care record
GET    /api/v1/perawatan/:id        # Get details
PUT    /api/v1/perawatan/:id        # Update care
DELETE /api/v1/perawatan/:id        # Delete care
```

### Gardening - Pruning (5 endpoints)
```
GET    /api/v1/pemangkasan          # List pruning
POST   /api/v1/pemangkasan          # Create pruning
GET    /api/v1/pemangkasan/:id      # Get details
PUT    /api/v1/pemangkasan/:id      # Update pruning
DELETE /api/v1/pemangkasan/:id      # Delete pruning
```

### Gardening - Harvest (6 endpoints)
```
GET    /api/v1/panen                # List harvest
POST   /api/v1/panen                # Create harvest
GET    /api/v1/panen/rekap          # Get harvest recap
GET    /api/v1/panen/:id            # Get harvest details
PUT    /api/v1/panen/:id            # Update harvest
DELETE /api/v1/panen/:id            # Delete harvest
```

### Gardening - Account-Land (5 endpoints)
```
GET    /api/v1/akun-lahan           # List assignments
POST   /api/v1/akun-lahan           # Create assignment
GET    /api/v1/akun-lahan/:id       # Get assignment
PUT    /api/v1/akun-lahan/:id       # Update assignment
DELETE /api/v1/akun-lahan/:id       # Delete assignment
```

### Gardening - Reminders (5 endpoints)
```
GET    /api/v1/pengingat-jadwal     # List reminders
POST   /api/v1/pengingat-jadwal     # Create reminder
GET    /api/v1/pengingat-jadwal/:id # Get reminder
PUT    /api/v1/pengingat-jadwal/:id # Update reminder
DELETE /api/v1/pengingat-jadwal/:id # Delete reminder
```

### Gardening - Notifications (5 endpoints)
```
GET    /api/v1/notifikasi           # List notifications
POST   /api/v1/notifikasi           # Create notification
GET    /api/v1/notifikasi/:id       # Get notification
PUT    /api/v1/notifikasi/:id       # Update notification
DELETE /api/v1/notifikasi/:id       # Delete notification
```

### Gardening - Activity Status (5 endpoints)
```
GET    /api/v1/status-aktivitas     # List statuses
POST   /api/v1/status-aktivitas     # Create status
GET    /api/v1/status-aktivitas/:id # Get status
PUT    /api/v1/status-aktivitas/:id # Update status
DELETE /api/v1/status-aktivitas/:id # Delete status
```

---

## 📡 API Response Format

All endpoints return standardized JSON responses:

**Success Response (200, 201)**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // Resource data here
  }
}
```

**Error Response (4xx, 5xx)**
```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

---

## 🔐 Authentication

### Getting Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmease.id","password":"admin123"}'
```

### Using Token
```bash
curl -X GET http://localhost:8080/api/sheep \
  -H "Authorization: Bearer <token_here>"
```

### Token Expiration
- Default: 24 hours
- Automatically refreshed on each successful request
- Clear localStorage to force re-login

---

## 🗄️ Database Schema Details

### Auth Schema
- **roles** - Role definitions with permissions
- **accounts** - User accounts with credentials

### Master Schema
- **farms** - Organization/farm entities
- **cages** - Livestock enclosure records
- **sheep_types** - Sheep breed types

### Livestock Schema
- **sheep** - Individual sheep records with genealogy
- **weights** - Weight tracking history
- **healths** - Health status records

### Breeding Schema
- **matings** - Mating records with inbreeding coefficient
- **pregnancies** - Pregnancy tracking
- **births** - Birth records and offspring

### Logistics Schema
- **feeds** - Master feed database
- **feedings** - Daily feeding logs
- **manures** - Manure collection tracking

### Operations Schema
- **tasks** - Operational tasks
- **notifications** - System notifications

### Gardening Schema
- **lahan** - Land/plot management
- **pohon** - Tree records
- **aktivitas** - Agricultural activities
- **perawatan** - Tree care records
- **pemangkasan** - Pruning records
- **panen** - Harvest records
- **akun_lahan** - User-land assignments
- **pengingat_jadwal** - Schedule reminders
- **notifikasi** - Gardening notifications
- **status_aktivitas** - Activity status types

---

## 🔄 Data Relationships

### Livestock Genealogy
```
Grandparents (Gen 1)
    ↓
Parents (Gen 2)
    ↓
Offspring (Gen 3)
    ↓
(Can continue to Gen 4+)
```

### Breeding Workflow
```
Mating → Pregnancy → Birth → New Sheep
  ↓
Inbreeding Check
```

### Activity Status Workflow
```
belum_dimulai → sedang_berjalan → selesai
      ↓              ↓
   dibatalkan    tertunda
```

---

## 🧪 Testing Endpoints with curl

**Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmease.id","password":"admin123"}'
```

**Get All Sheep**
```bash
curl -X GET http://localhost:8080/api/sheep \
  -H "Authorization: Bearer <token>"
```

**Create Sheep**
```bash
curl -X POST http://localhost:8080/api/sheep \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sheep_code":"D-100",
    "sheep_name":"Baru Test",
    "gender":"jantan",
    "date_of_birth":"2024-01-01",
    "status":"aktif",
    "origin":"beli",
    "id_cage":1,
    "id_type":1
  }'
```

**Record Health**
```bash
curl -X POST http://localhost:8080/api/sheep/1/health \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "health_status":"sehat",
    "description":"Check up rutin",
    "date_recorded":"2025-01-25"
  }'
```

---

## ⚠️ Important Notes

1. **Database Backup**
   ```bash
   pg_dump -U postgres farmease > backup.sql
   ```

2. **Reset Database**
   ```bash
   dropdb -U postgres farmease
   createdb -U postgres farmease
   go run main.go migrate
   psql -U postgres -d farmease < seeders/10_comprehensive_seed.sql
   ```

3. **CORS Configuration**
   - All origins enabled by default (`*`)
   - Modify in `config/config.json` if needed

4. **Logs**
   - Server logs available in console output
   - Check for migration errors at startup

5. **Health Check**
   - Server ready when logs show "Starting server on :8080"
   - API health: `GET http://localhost:8080/health`

---

## 📈 Performance Considerations

1. **Pagination**
   - Default page size: 20 items
   - Maximum: 100 items per page
   - Use query params: `?page=2&per_page=50`

2. **Filtering**
   - Use query parameters for filtering
   - Example: `?id_cage=1&gender=jantan&status=aktif`

3. **Indexes**
   - Automatically created by migrations
   - On frequently queried fields (id_sheep, id_lahan, etc.)

---

## 🎯 Production Checklist

- [ ] Change all default passwords
- [ ] Configure CORS for specific domains
- [ ] Setup SSL/TLS certificates
- [ ] Enable database backups
- [ ] Configure logging/monitoring
- [ ] Test failure scenarios
- [ ] Document custom configurations
- [ ] Setup CI/CD pipeline
- [ ] Performance load testing
- [ ] Security audit

---

**Backend Ready for Production!** 🚀

For Frontend Integration Guide, see: `INTEGRATION_GUIDE.md` in Farmease FE directory.
