# Rencana Pemisahan Sistem FARMease (SSO, Peternakan, Perkebunan)

Dokumen ini memuat arsitektur, struktur repositori, dan strategi komunikasi antar-layanan saat memisahkan proyek FARMease menjadi 3 repositori Git terpisah: **Git SSO**, **Git Ternak**, dan **Git Kebun**.

---

## 1. Pembagian Struktur Repositori Git

Setiap repositori akan menyimpan kode Frontend dan Backend dari modulnya masing-masing untuk menjaga isolasi penuh:

```
├── Repositori 1: farmease-sso (Otentikasi Terpusat)
│   ├── sso-be/          (Go Backend SSO - Port 8080)
│   ├── Farmease_sso/    (Vue Frontend SSO - Port 3000)
│   └── docker-compose.yml
│
├── Repositori 2: farmease-ternak (Modul Peternakan)
│   ├── Farmease-BE/     (Go Backend Peternakan - Port 8081)
│   ├── Farmease/        (Vue Frontend Peternakan - Port 3001)
│   └── docker-compose.yml
│
└── Repositori 3: farmease-kebun (Modul Perkebunan)
    ├── kebun-be/        (Go Backend Perkebunan - Port 8082)
    ├── Farmease_kebun/  (Vue Frontend Perkebunan - Port 3002)
    └── docker-compose.yml
```

---

## 2. Mekanisme Komunikasi Antar-Layanan

Meskipun berjalan di repositori dan server yang terpisah, ketiga layanan tetap dapat berkomunikasi dengan lancar menggunakan 2 metode berikut:

### 2.1. Komunikasi Sinkron (Otentikasi & Validasi Sesi) — HTTP REST API
Ketika pengguna mengakses modul Ternak atau Kebun, token JWT perlu divalidasi ke SSO.

```
┌──────────────┐                  ┌─────────────────┐                  ┌────────────────┐
│ Ternak Portal│                  │ Ternak Backend  │                  │  SSO Backend   │
│ (Vue, Port   │                  │ (Go, Port 8081) │                  │ (Go, Port 8080)│
│    3001)     │                  │                 │                  │                │
└──────┬───────┘                  └────────┬────────┘                  └───────┬────────┘
       │                                   │                                   │
       │ 1. Request data + Header JWT      │                                   │
       ├──────────────────────────────────►│                                   │
       │                                   │ 2. Validasi Token via REST        │
       │                                   │    GET /auth/validate             │
       │                                   ├──────────────────────────────────►│
       │                                   │                                   │
       │                                   │ 3. Return Payload User            │
       │                                   │    (Valid / Invalid)              │
       │                                   │◄──────────────────────────────────┤
       │                                   │                                   │
       │ 4. Response Data / Grant Access   │                                   │
       │◄──────────────────────────────────┤                                   │
```
- **Implementasi**: Backend Ternak dan Kebun memanggil HTTP API SSO secara langsung.
- **Konfigurasi**: Cukup set Environment Variable pada backend Ternak dan Kebun agar mengarah ke URL SSO:
  ```env
  APP_SSOAPIURL=http://<domain-sso-anda>
  ```

### 2.2. Komunikasi Asinkron (Integrasi Data) — Event-Driven via RabbitMQ
Digunakan saat terjadi distribusi sisa panen di modul Perkebunan yang harus menambah stok pakan di modul Peternakan tanpa mengharuskan kedua backend terhubung secara langsung.

```
┌──────────────────┐               ┌────────────────┐               ┌──────────────────┐
│  Kebun Backend   │               │    RabbitMQ    │               │  Ternak Backend  │
│ (Go, Port 8082)  │               │(Message Broker)│               │ (Go, Port 8081)  │
└────────┬─────────┘               └───────┬────────┘               └────────┬─────────┘
         │                                 │                                 │
         │ 1. Publish Event                │                                 │
         │    "crop_residue_distributed"   │                                 │
         ├────────────────────────────────►│                                 │
         │                                 │ 2. Forward Event ke Queue       │
         │                                 ├────────────────────────────────►│
         │                                 │                                 │ (Menerima data &
         │                                 │                                 │  update stok pakan)
```
- **Implementasi**: Menggunakan RabbitMQ sebagai perantara. Backend Kebun bertindak sebagai **Publisher** dan Backend Ternak bertindak sebagai **Consumer**.
- **Konfigurasi**: Kedua backend dihubungkan ke host RabbitMQ yang sama melalui variabel:
  ```env
  APP_RABBITMQ_URL=amqp://guest:guest@<domain-rabbitmq-anda>:5672/
  ```

---

## 3. Strategi Konfigurasi Environment & Port

### 3.1. Proyek SSO (`farmease-sso`)
- **Backend Port**: `8080`
- **Frontend Port**: `3000`
- **Variabel Penting**:
  ```env
  APP_PORT=8080
  APP_POSTGRES_URL=postgres://user:pass@sso-db:5432/farmease_sso
  APP_REDIRECTURL=http://localhost:3000/callback
  ```

### 3.2. Proyek Peternakan (`farmease-ternak`)
- **Backend Port**: `8081`
- **Frontend Port**: `3001`
- **Variabel Penting**:
  ```env
  APP_PORT=8081
  APP_POSTGRES_URL=postgres://user:pass@ternak-db:5432/farmease_peternakan
  APP_SSOAPIURL=http://sso-backend:8080
  APP_RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
  ```

### 3.3. Proyek Perkebunan (`farmease-kebun`)
- **Backend Port**: `8082`
- **Frontend Port**: `3002`
- **Variabel Penting**:
  ```env
  APP_PORT=8082
  APP_POSTGRES_URL=postgres://user:pass@kebun-db:5432/farmease_kebun
  APP_SSOAPIURL=http://sso-backend:8080
  APP_RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
  ```

---

## 4. Cara Menjalankan Layanan Saat Pengembangan Lokal (Local Dev)

Agar kontainer Docker di ketiga repositori yang terpisah tetap bisa berkomunikasi satu sama lain di komputer lokal Anda, buatlah **Docker Network Bersama (Shared Network)**:

1. **Buat network eksternal di terminal komputer Anda (hanya sekali):**
   ```bash
   docker network create farmease_shared_network
   ```

2. **Sesuaikan blok `networks` di setiap `docker-compose.yml` masing-masing proyek:**
   ```yaml
   networks:
     farmease_network:
       name: farmease_shared_network
       external: true
   ```
   *Dengan cara ini, kontainer dari repositori `farmease-ternak` dapat memanggil `http://sso_backend:8080` secara langsung karena berada dalam satu network Docker virtual yang sama.*
