# Farmease FE & BE Integration Guide

**Last Updated**: January 2025  
**Status**: Ready for Integration Testing  
**Frontend**: Vue 3 + TypeScript  
**Backend**: Go + Fiber + PostgreSQL

---

## 📋 Quick Summary

| Component | Status | Details |
|-----------|--------|---------|
| **BE Implementation** | ✅ Complete | 24 modules, 90+ endpoints, 23 tables |
| **FE API Client** | ✅ Complete | Axios client, auth interceptors, service layer |
| **Endpoint Alignment** | ✅ Fixed | All path discrepancies corrected |
| **Database Seeders** | ✅ Enhanced | Comprehensive test data for all modules |
| **Documentation** | ✅ Complete | Full integration guide available |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- Go 1.20+
- PostgreSQL 14+
- npm or pnpm

### FE Setup

1. **Install Dependencies**
   ```bash
   cd Farmease
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Already set in .env.local
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

### BE Setup

1. **Run Migrations**
   ```bash
   cd farmease-be/farmease
   go run main.go migrate
   ```

2. **Seed Database**
   ```bash
    # Menggunakan helper script di root directory:
    # Windows:
    docker-manage.bat seed
    # Linux/macOS:
    ./docker-manage.sh seed

    # ATAU secara manual di dalam container backend:
    docker-compose exec backend sh -c 'for file in auth.sql farms.sql cages.sql sheep.sql breedings.sql feeds.sql healths.sql manures.sql notifications.sql tasks.sql weights.sql; do psql "$APP_POSTGRES_URL" -f "/app/seeders/$file" || exit 1; done'
   ```

3. **Start Backend Server**
   ```bash
   go run main.go serve
   ```
   Server will run on `http://localhost:8080`

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication

**Login Endpoint:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@farmease.id",
  "password": "admin123"
}

Response:
{
  "status": "success",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "admin@farmease.id",
      "role_id": 1,
      ...
    }
  }
}
```

### Default Test Accounts

| Username | Password | Role | Module |
|----------|----------|------|--------|
| admin | admin123 | Admin | All |
| operator_ternak | operator123 | Operator Ternak | Livestock |
| operator_perkebunan | operator123 | Operator Perkebunan | Gardening |
| peternak1 | peternak123 | Peternak | Livestock |
| petani1 | petani123 | Petani | Gardening |

---

## 🔗 Endpoint Corrections Applied

All FE API calls have been corrected to match BE actual endpoints:

### Livestock Endpoints
```typescript
// Health Records - Updated
GET    /api/sheep/:id/health         // Get sheep health history
POST   /api/sheep/:id/health         // Record health
GET    /api/healths                  // Get all health records
PUT    /api/healths/:id              // Update health record

// Weight Tracking - Updated
GET    /api/sheep/:id/weight         // Get sheep weight history
POST   /api/sheep/:id/weight         // Record weight
GET    /api/weights                  // Get all weight records

// Manure Collection - Correct
GET    /api/sheep/:id/manures        // Get manure history
POST   /api/sheep/:id/manures        // Record manure
GET    /api/manures                  // Get all manure records

// Breeding/Mating - Updated
POST   /api/matings/check-inbreeding // Check inbreeding
GET    /api/matings                  // Get all matings
POST   /api/matings                  // Record mating
GET    /api/matings/:id              // Get mating detail
PATCH  /api/matings/:id/status       // Update mating status

// Pregnancy & Birth - Updated
POST   /api/pregnancies              // Record pregnancy
GET    /api/pregnancies              // Get all pregnancies
PATCH  /api/pregnancies/:id/status   // Update pregnancy status
POST   /api/births                   // Record birth
GET    /api/births                   // Get all births

// Feeding - Correct
GET    /api/sheep/:id/feedings       // Get feeding history
POST   /api/sheep/:id/feedings       // Record feeding
GET    /api/feedings                 // Get all feeding records
```

### Gardening Endpoints
```typescript
// All endpoints use /api/v1 prefix
GET/POST   /api/v1/lahan             // Land management
GET/POST   /api/v1/pohon             // Tree management
GET/POST   /api/v1/aktivitas         // Activities
GET/POST   /api/v1/perawatan         // Tree care
GET/POST   /api/v1/pemangkasan       // Pruning records
GET/POST   /api/v1/panen             // Harvest records
GET/POST   /api/v1/akun-lahan        // Account-land assignments
GET/POST   /api/v1/jadwal-rutin      // Routine schedules
GET/POST   /api/v1/notifikasi        // Notifications
GET/POST   /api/v1/status-aktivitas  // Activity status
```

---

## 📦 API Service Layer

### Using the API Client in FE Components

**Example 1: Livestock Operations**
```typescript
import { sheepApi, feedsApi, healthApi } from '@/shared/api'

export default {
  async loadSheepData() {
    try {
      // Get all sheep
      const sheepList = await sheepApi.getList()
      
      // Get specific sheep details
      const sheep = await sheepApi.getById(1)
      
      // Get sheep genealogy
      const genealogy = await sheepApi.getGenealogy(1)
      
      // Record health
      const health = await healthApi.create(1, {
        health_status: 'sehat',
        description: 'Kondisi baik',
        date_recorded: new Date().toISOString().split('T')[0]
      })
      
      this.sheepList = sheepList
    } catch (error) {
      console.error('Error loading sheep:', error)
    }
  }
}
```

**Example 2: Gardening Operations**
```typescript
import { lahanApi, pohonApi, panenApi } from '@/shared/api'

export default {
  async loadGardeningData() {
    try {
      // Get all lands
      const lands = await lahanApi.getList()
      
      // Get trees for specific land
      const trees = await pohonApi.getList()
      
      // Record harvest
      const harvest = await panenApi.create({
        tanggal_panen: new Date().toISOString().split('T')[0],
        jumlah_panen: 45.5,
        unit: 'kg_buah',
        kualitas: 'premium',
        harga_per_unit: 35000,
        id_pohon: 1
      })
      
      this.lands = lands
      this.harvests = harvests
    } catch (error) {
      console.error('Error loading gardening data:', error)
    }
  }
}
```

---

## 🗄️ Database Structure

### Schemas & Tables

**Auth Schema** (2 tables)
- roles
- accounts

**Master Schema** (3 tables)
- farms
- cages
- sheep_types

**Livestock Schema** (3 tables)
- sheep
- weights
- healths

**Breeding Schema** (3 tables)
- matings
- pregnancies
- births

**Logistics Schema** (3 tables)
- feeds
- feedings
- manures

**Operations Schema** (2 tables)
- tasks
- notifications

**Gardening Schema** (10 tables)
- lahan
- pohon
- aktivitas
- perawatan
- pemangkasan
- panen
- akun_lahan
- jadwal_rutin
- notifikasi
- status_aktivitas

---

## 📊 Test Data Available

### Livestock Seeder Data
- **4 Sheep Generations** - Full genealogy from grandparents to grandchildren
- **7 Health Records** - Various health statuses
- **12 Weight Records** - Tracking weight progression
- **7 Feed Types** - Master feed database with stock levels
- **15 Feeding Records** - Daily feeding logs
- **8 Manure Records** - Collection tracking
- **4 Mating Records** - Breeding documentation
- **3 Pregnancy Records** - Pregnancy tracking
- **1 Birth Record** - Birth documentation

### Gardening Seeder Data
- **5 Land Plots** - Different agricultural zones
- **10 Trees** - Multiple crops (kopi, cokelat, teh)
- **5 Activities** - Various agricultural tasks
- **7 Care Records** - Tree maintenance logs
- **4 Pruning Records** - Pruning history
- **7 Harvest Records** - Production records
- **7 Account-Land Assignments** - User permissions
- **5 Routine Schedules** - Recurring tasks
- **5 Notifications** - System alerts

---

## 🧪 Testing Workflow

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd farmease-be/farmease
go run main.go serve

# Terminal 2: Frontend
cd Farmease
npm run dev
```

### 2. Test Authentication
1. Navigate to `http://localhost:3000`
2. Login with test account (e.g., admin/admin123)
3. Verify token is stored in localStorage

### 3. Test Each Module
- **Livestock**: Check sheep list, health records, breeding data
- **Gardening**: Check lands, trees, harvest records
- **Notifications**: Verify system notifications display
- **Tasks**: Check task management features

### 4. Verify API Integration
Open browser DevTools → Network tab to verify API calls:
- ✅ Requests go to `http://localhost:8080`
- ✅ Authorization header includes Bearer token
- ✅ Responses follow `{status, message, data}` format

---

## 📝 Common API Patterns

### List with Filtering & Pagination
```typescript
// Most endpoints support filtering
const results = await apiClient.get('/api/sheep', {
  params: {
    id_cage: 1,
    gender: 'jantan',
    status: 'aktif',
    page: 1,
    per_page: 20
  }
})
```

### CRUD Operations
```typescript
// CREATE
const item = await apiClient.post('/api/endpoint', payload)

// READ
const item = await apiClient.get('/api/endpoint/:id')

// UPDATE
const item = await apiClient.put('/api/endpoint/:id', payload)

// PATCH (Partial Update)
const item = await apiClient.patch('/api/endpoint/:id/field', { field: value })

// DELETE
await apiClient.delete('/api/endpoint/:id')
```

---

## 🛠️ Troubleshooting

### 401 Unauthorized
- Clear localStorage: `localStorage.clear()`
- Logout and login again
- Check token expiration

### 404 Not Found
- Verify endpoint path matches BE implementation
- Check resource ID exists
- Refer to endpoint corrections table above

### CORS Errors
- Backend CORS is enabled for all origins (`*`)
- Check `VITE_API_BASE_URL` in `.env.local`
- Ensure BE server is running

### Connection Refused
- Verify BE server is running on port 8080
- Check `http://localhost:8080` in browser
- Review BE logs for startup errors

---

## 📚 Files Created/Modified

### Frontend Files Created
```
Farmease/src/shared/api/
├── client.ts                 # Axios client with interceptors
├── auth.ts                   # Authentication API
├── peternakan.ts             # Livestock API
├── perkebunan.ts             # Gardening API
└── index.ts                  # Export all APIs

Farmease/
├── .env.example              # Environment template
└── .env.local                # Development configuration
```

### Backend Files Created
```
Farmease-BE/farmease/seeders/
├── auth.sql
├── breedings.sql
├── cages.sql
├── farms.sql
├── feeds.sql
├── healths.sql
├── manures.sql
├── notifications.sql
├── sheep.sql
├── tasks.sql
└── weights.sql
```

### Documentation Updated
- `farmease-integration-plan.md` - Complete integration plan
- This file - Integration guide

---

## ✅ Integration Checklist

- [x] FE API client setup (axios + interceptors)
- [x] Authentication service created
- [x] Livestock API service created
- [x] Gardening API service created
- [x] Endpoint path corrections applied
- [x] Database seeders enhanced
- [x] Environment configuration files created
- [x] API documentation provided
- [x] Test data prepared
- [ ] **Next**: FE component implementation (update stores/pages with API calls)
- [ ] Full end-to-end testing
- [ ] Production deployment

---

## 📞 Support & Documentation

- **API Swagger**: `http://localhost:8080/swagger/index.html` (when backend running)
- **Backend Docs**: See `farmease-be/Docs/`
- **Integration Plan**: See `farmease-integration-plan.md`
- **API Responses**: All endpoints return `{status, message, data}` format

---

## 🎯 Next Steps

1. **Implement FE Components**
   - Update store files to use API client
   - Replace mock data with actual API calls
   - Add loading states and error handling

2. **End-to-End Testing**
   - Test all CRUD operations
   - Verify data persistence
   - Check validation and error messages

3. **Production Preparation**
   - Setup production environment files
   - Configure CI/CD pipelines
   - Performance testing and optimization

---

**Ready for Integration!** 🚀
