# 🌾 Farmease Ecosystem

![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Sistem Manajemen Terintegrasi untuk **Peternakan**, **Perkebunan**, dan **Single Sign-On (SSO)** berbasis Arsitektur Microservices.

---

## 📌 Daftar Isi
- [Arsitektur & Komponen](#-arsitektur--komponen)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Struktur Port & Layanan](#-struktur-port--layanan)
- [Panduan Instalasi & Konfigurasi](#-panduan-instalasi--konfigurasi)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Konfigurasi Environment (.env)](#2-konfigurasi-environment-env)
  - [3. Menjalankan Layanan (Local Development)](#3-menjalankan-layanan-local-development)
  - [4. Menjalankan Lingkungan Staging / Production](#4-menjalankan-lingkungan-staging--production)
- [Struktur Direktori](#-struktur-direktori)
- [Lisensi](#-lisensi)

---

## 🏗️ Arsitektur & Komponen

Farmease terdiri dari 3 modul microservices backend dan 3 aplikasi frontend yang terintegrasi:

| Modul | Backend (Go) | Frontend (React + Vite) | Database |
| :--- | :--- | :--- | :--- |
| **SSO (Single Sign-On)** | `sso-be/sso` (Port 8080) | `Farmease_sso` (Port 3000) | PostgreSQL (5435) + Redis (6381) |
| **Peternakan** | `Farmease-BE/farmease` (Port 8081) | `Farmease` (Port 3001) | PostgreSQL (5436) + RabbitMQ (5672/15672) |
| **Perkebunan** | `kebun-be/kebun` (Port 8082) | `Farmease_kebun` (Port 3002) | PostgreSQL (5437) |

---

## ⚡ Prasyarat Sistem

Sebelum memulai instalasi, pastikan sistem Anda telah terpasang perangkat lunak berikut:

* **Git**: `v2.30+`
* **Docker & Docker Compose**: `v2.0+`
* **Node.js**: `v18+` & **npm**: `v9+` *(Untuk pengujian/pengembangan frontend lokal)*
* **Go**: `v1.21+` *(Untuk pengembangan backend tanpa Docker)*

---

## 🔌 Struktur Port & Layanan

### **Environment Local**
| Service | Type | Container / Local Port | Host Port |
| :--- | :--- | :--- | :--- |
| **SSO Database** | PostgreSQL | `5432` | `5435` |
| **Peternakan Database** | PostgreSQL | `5432` | `5436` |
| **Kebun Database** | PostgreSQL | `5432` | `5437` |
| **SSO Redis** | Cache | `6379` | `6381` |
| **Peternakan RabbitMQ** | Message Broker | `5672` / `15672` | `5672` / `15672` |
| **SSO Backend** | Go API | `8080` | `8080` |
| **Peternakan Backend** | Go API | `8081` | `8081` |
| **Kebun Backend** | Go API | `8082` | `8082` |
| **SSO Frontend** | React App | `3000` | `3000` |
| **Peternakan Frontend** | React App | `3001` | `3001` |
| **Kebun Frontend** | React App | `3002` | `3002` |

---

## 🚀 Panduan Instalasi & Konfigurasi

### 1. Clone Repository

```bash
git clone https://github.com/MuhammadHamidy/Farmease.git
cd Farmease
```

---

### 2. Konfigurasi Environment (`.env`)

Salin berkas `.env.example` atau `.env.*.example` menjadi `.env` pada root project serta pada masing-masing subfolder modul:

#### **A. Root Environment**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

#### **B. Frontend Modules**
```bash
# Peternakan Frontend
Copy-Item Farmease\.env.local.example Farmease\.env.local

# Kebun Frontend
Copy-Item Farmease_kebun\.env.local.example Farmease_kebun\.env.local

# SSO Frontend
Copy-Item Farmease_sso\.env.local.example Farmease_sso\.env.local
```

#### **C. Backend Modules**
```bash
# SSO Backend
Copy-Item sso-be\sso\.env.example sso-be\sso\.env
Copy-Item sso-be\sso\config\config.example.json sso-be\sso\config\config.json

# Peternakan Backend
Copy-Item Farmease-BE\farmease\.env.example Farmease-BE\farmease\.env
Copy-Item Farmease-BE\farmease\config\config.example.json Farmease-BE\farmease\config\config.json

# Kebun Backend
Copy-Item kebun-be\kebun\.env.example kebun-be\kebun\.env
Copy-Item kebun-be\kebun\config\config.example.json kebun-be\kebun\config\config.json
```

---

### 3. Menjalankan Layanan (Local Development)

#### **Opsi A: Menggunakan Docker Compose (Direkomendasikan)**

Jalankan seluruh infrastruktur database, redis, rabbitmq, serta backend secara bersamaan:

```bash
docker-compose up -d
```

Untuk menghentikan layanan:
```bash
docker-compose down
```

#### **Opsi B: Menjalankan Backend Secara Lokal (PowerShell)**

Jika ingin menjalankan backend secara langsung dari binary Go dengan database di Docker:

```powershell
.\run_local_backends.ps1
```

#### **Opsi C: Menjalankan Frontend secara Terpisah**

Buka terminal pada folder frontend yang diinginkan dan jalankan:

```bash
# Contoh: Menjalankan Frontend Peternakan
cd Farmease
npm install
npm run dev
```

Aplikasi frontend dapat diakses di browser:
- **SSO**: `http://localhost:3000`
- **Peternakan**: `http://localhost:3001`
- **Kebun**: `http://localhost:3002`

---

### 4. Menjalankan Lingkungan Staging / Production

#### **Staging Environment**
```bash
docker-compose -f docker-compose.staging.yml up -d --build
```

#### **Production Environment**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📂 Struktur Direktori

### 🌐 1. Root Ecosystem Structure
```plain

Farmease/
├── .env.example                # Root environment template
├── .gitignore                  # Root Git ignore rules
├── docker-compose.yml          # Local Docker Compose setup
├── docker-compose.staging.yml  # Staging environment orchestration
├── docker-compose.prod.yml     # Production environment orchestration
├── run_local_backends.ps1      # PowerShell helper script untuk backend local
├── go.work / go.work.sum       # Go workspace configuration
├── Farmease/                   # Frontend Peternakan (React + Vite)
├── Farmease_kebun/             # Frontend Kebun (React + Vite)
├── Farmease_sso/               # Frontend SSO (React + Vite)
├── Farmease-BE/                # Backend Peternakan (Go)
├── kebun-be/                   # Backend Kebun (Go)
├── sso-be/                     # Backend SSO (Go)
└── nginx/                      # Configuration Reverse Proxy Nginx
```

---

### 📱 2. Frontend Modules (React + Vite + TypeScript)

<details>
<summary><b>📂 Farmease (Frontend Peternakan)</b></summary>

```plain
Farmease/
├── .env.example                # Template environment dasar
├── .env.local.example          # Template environment local (http://127.0.0.1:8081)
├── .env.staging.example        # Template environment staging (netrash.id)
├── .env.production.example     # Template environment production (farmease.id)
├── Dockerfile                  # Container build config (Multi-stage build)
├── vite.config.ts              # Konfigurasi Vite server & build
├── package.json / package-lock.json
└── src/
    ├── main.ts / App.tsx       # Entry point aplikasi React
    ├── router/                 # Config routing (React Router)
    ├── store/                  # Global state management
    ├── modules/                # Feature-based components & views (Ternak, Penjualan, dll)
    └── shared/                 # Shared UI components, hooks, utils, types
```
</details>

<details>
<summary><b>📂 Farmease_kebun (Frontend Perkebunan)</b></summary>

```plain
Farmease_kebun/
├── .env.example                # Template environment dasar
├── .env.local.example          # Template environment local (http://127.0.0.1:8082)
├── .env.staging.example        # Template environment staging
├── .env.production.example     # Template environment production
├── Dockerfile                  # Container build config
├── vite.config.ts              # Konfigurasi Vite
├── package.json
└── src/
    ├── main.ts / App.tsx       # Entry point
    ├── modules/                # Fitur Kebun (Pemilik, Pekerja, Panen, Lahan)
    ├── router/                 # Routing modul kebun
    └── shared/                 # Shared UI & utility hooks
```
</details>

<details>
<summary><b>📂 Farmease_sso (Frontend Single Sign-On)</b></summary>

```plain
Farmease_sso/
├── .env.example                # Template environment dasar
├── .env.local.example          # Template environment local (http://127.0.0.1:8080)
├── .env.staging.example        # Template environment staging
├── .env.production.example     # Template environment production
├── Dockerfile                  # Container build config
├── vite.config.ts              # Konfigurasi Vite
├── package.json
└── src/
    ├── main.ts / App.tsx       # Entry point SSO
    ├── modules/                # Fitur Autentikasi (Login, Register, Callback, Profile)
    └── shared/                 # UI Kit, Theme & Axios Client
```
</details>

---

### ⚙️ 3. Backend Microservices (Go / Fiber)

<details>
<summary><b>📂 Farmease-BE (Backend Peternakan)</b></summary>

```plain
Farmease-BE/
├── docker-compose.yml          # Container compose mandiri backend peternakan
└── farmease/                   # Main Go application root
    ├── .env.example            # Environment template backend peternakan
    ├── Dockerfile              # Docker build file Go multi-stage
    ├── Makefile                # Shortcut perintah make (build, run, test)
    ├── main.go                 # Application entry point
    ├── config/
    │   ├── config.go           # Struct config & loader
    │   └── config.example.json # JSON configuration template
    ├── cmd/                    # CLI commands & migration scripts
    ├── migrations/             # SQL Migration files (PostgreSQL)
    ├── module/                 # Layered Modules (Ternak, Kesehatan, Pakan, Keuangan)
    ├── seeders/                # Database seed data
    └── tests/                  # Unit & Integration Tests
```
</details>

<details>
<summary><b>📂 kebun-be (Backend Perkebunan)</b></summary>

```plain
kebun-be/
├── docker-compose.yml          # Container compose mandiri backend kebun
└── kebun/                      # Main Go application root
    ├── .env.example            # Environment template backend kebun
    ├── Dockerfile              # Docker build file
    ├── Makefile                # Shortcut perintah build & run
    ├── main.go                 # Entry point backend kebun
    ├── config/
    │   ├── config.go           # Loader konfigurasi
    │   └── config.example.json # JSON config template
    ├── cmd/                    # Command CLI & Runner
    ├── migrations/             # Migration SQL (Kebun DB)
    ├── module/                 # Layered Architecture (Lahan, Tanaman, Panen, Pekerja)
    └── seeders/                # Seeders data kebun
```
</details>

<details>
<summary><b>📂 sso-be (Backend Single Sign-On)</b></summary>

```plain
sso-be/
├── docker-compose.yml          # Container compose mandiri SSO backend
└── sso/                        # Main Go application root
    ├── .env.example            # Environment template SSO
    ├── Dockerfile              # Multi-stage Dockerfile Go
    ├── Makefile                # Automation commands
    ├── main.go                 # SSO Entry point
    ├── config/
    │   ├── config.go           # Config structs & environment parser
    │   └── config.example.json # JSON template config
    ├── migrations/             # Migration SQL (User, Role, Token, Session)
    ├── module/                 # Layered Auth (User Service, Token Issuer, OAuth/JWT)
    ├── seeders/                # Superadmin & default roles seeder
    └── tests/                  # Autentikasi unit tests
</details>

---

## 📝 Lisensi

Proyek ini dikembangkan untuk kebutuhan akademik dan operasional sistem terintegrasi **Farmease**.
All rights reserved.
