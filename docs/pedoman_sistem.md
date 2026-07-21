# Pedoman Sistem Peternakan (FARMease Livestock System Guide)

Dokumen ini merupakan pedoman teknis arsitektur, instalasi, pengoperasian, dan pengujian untuk modul **Peternakan (Ternak)** pada sistem FARMease yang terintegrasi dengan Single Sign-On (SSO) dan broker pesan RabbitMQ.

---

## 1. Arsitektur & Komponen Sistem

Modul Peternakan menggunakan arsitektur layanan terpisah (multi-service) berbasis **Go (native backend)** dan **Vue 3 (Vite + TSX frontend)** dengan infrastruktur pendukung PostgreSQL, Redis, dan RabbitMQ.

```
                  ┌─────────────────┐
                  │   SSO Portal    │ (Vue 3, Port 3000)
                  └────────┬────────┘
                           │ Authenticate
                           ▼
                  ┌─────────────────┐
                  │   SSO Backend   │ (Go, Port 8080)
                  └────────┬────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼ Session Tokens                        ▼ Session Tokens
┌───────────────┐                       ┌───────────────┐
│  Ternak Portal│ (Vue 3, Port 3001)    │  SSO Database │
└───────┬───────┘                       └───────────────┘
        │
        ▼ HTTP REST
┌───────────────┐
│Ternak Backend │ (Go, Port 8081)
└───────┬───────┘
        │
        │           ┌─────────────────┐
        └──────────►│   RabbitMQ      │
      Consume Event │(Message Broker) │ (Menerima Event sisa panen kebun)
                    └─────────────────┘
```

### Detail Komponen:
1. **Peternakan / Ternak Portal & Backend (Port 3001 & 8081)**: Modul utama bagi Operator Ternak dan Admin untuk melakukan pencatatan domba, manajemen kandang, rekam medis/kesehatan, jadwal tugas harian, dan gudang stok pakan.
2. **SSO Portal & Backend (Port 3000 & 8080)**: Mengelola sesi login pengguna, peran (Owner, Admin, Operator), dan memvalidasi akses ke modul Peternakan.
3. **RabbitMQ (Port 5672 & 15672)**: Bertanggung jawab mengirimkan event integrasi secara asinkron dari modul lain untuk secara otomatis menambah stok pakan peternakan saat ada distribusi sisa panen.
4. **PostgreSQL (Port 5435)**: Menyimpan skema database peternakan di database `farmease_peternakan` dan data otentikasi di `farmease_sso`.
5. **Redis (Port 6381)**: Menyimpan sesi otentikasi.

---

## 2. Struktur Proyek & Repositori (Project & Repository Structure)

Untuk memudahkan pemahaman organisasi berkas dan arsitektur kode modul Peternakan, berikut adalah penjelasan detail mengenai struktur direktori repositori, backend, dan frontend.

### 2.1. Peta Direktori Workspace (Workspace Directory Map)
Repositori ini dirancang sebagai monorepo/multi-service workspace yang membagi modul peternakan, perkebunan, dan Single Sign-On (SSO):
- [Farmease-BE](../Farmease-BE): Backend untuk modul Peternakan (Ternak) [Go Workspace].
- [Farmease](../Farmease): Frontend/Portal untuk modul Peternakan (Ternak) [Vue 3 + TSX].
- [sso-be](../sso-be): Backend untuk layanan SSO (Otentikasi & Sesi) [Go].
- [Farmease_sso](../Farmease_sso): Frontend/Portal untuk layanan SSO [Vue 3].
- [kebun-be](../kebun-be): Backend untuk modul Perkebunan (Kebun) [Go Workspace].
- [Farmease_kebun](../Farmease_kebun): Frontend/Portal untuk modul Perkebunan (Kebun) [Vue 3 + TSX].
- [docs](../docs): Berkas dokumentasi perancangan, diagram kelas, dan pedoman sistem.

---

### 2.2. Arsitektur Go Backend (`Farmease-BE`)
Backend modul peternakan diorganisasikan menggunakan **Go Workspaces** (`go.work`) untuk memisahkan kode domain dengan kerangka kerja (framework) dan pustaka (libraries).

#### Visualisasi Struktur Folder Backend:
```text
Farmease-BE/
├── framework/            # Inisialisasi Fiber, Middleware, Logging, bunnymq
├── libraries/            # Utilitas reusable (publisher & consumer RabbitMQ)
├── go.work               # Go workspace configuration
└── farmease/             # Aplikasi utama Peternakan
    ├── cmd/              # CLI entrypoints (serve, seed)
    ├── config/           # Konfigurasi aplikasi
    ├── migrations/       # SQL migrations (40+ migrasi)
    ├── seeders/          # Seeder data
    └── module/           # Domain modules (Clean Architecture)
        └── sheep/        # Contoh Modul Domba
            ├── domain/   # Interface & Entitas Data Domba
            ├── usecase/  # Logika Bisnis Domba
            ├── repository/# Implementasi akses DB Domba
            ├── delivery/ # HTTP Handler & Router Domba (Fiber)
            └── module.go # FX Dependency Injection Wiring
```

#### Struktur Utama `Farmease-BE`:
1. `go.work`: Berkas konfigurasi workspace yang menyatukan sub-modul `./framework`, `./libraries`, dan `./farmease`.
2. [framework](../Farmease-BE/framework): Berisi implementasi boilerplate pemrosesan aplikasi tingkat tinggi seperti inisialisasi server Fiber, middleware, logging, konfigurasi database, dan RabbitMQ (`bunnymq`).
3. [libraries](../Farmease-BE/libraries): Pustaka utilitas pembantu yang reusable, seperti publisher dan consumer RabbitMQ.
4. [farmease](../Farmease-BE/farmease): Aplikasi utama peternakan.
   - `cmd/`: Titik masuk eksekusi program (entrypoint CLI) seperti `serve` untuk menjalankan API server dan `seed` untuk data pengujian.
   - `config/`: Berkas konfigurasi spesifik peternakan.
   - `migrations/`: Berkas SQL migrasi skema database PostgreSQL.
   - `seeders/`: Injeksi data awal (seeder) untuk pengujian.
   - `module/`: Implementasi logika domain peternakan yang menggunakan **Clean Architecture** yang didekorasi dengan Dependency Injection **Uber Fx** (`go.uber.org/fx`).

#### Clean Architecture Layer di `farmease/module/<domain_name>`:
Setiap modul di bawah folder `module/` (seperti `sheep`, `cages`, `breedings`, `pregnancies`, `feeds`, dll) mengikuti struktur lapisan berikut:
- **`domain/`**: Berisi definisi kontrak berupa interface repositori & usecase serta struktur data (entities/models) inti domain tersebut. Lapisan ini tidak memiliki dependensi ke pustaka eksternal (framework agnostic).
- **`usecase/`**: Berisi implementasi dari interface usecase (logika bisnis utama). Lapisan ini memproses aturan bisnis, memanggil repositori, dan memicu event eksternal (seperti memublikasikan event sisa panen ke RabbitMQ).
- **`repository/`**: Berisi implementasi dari interface repositori (akses data ke PostgreSQL menggunakan SQL native atau helper DB).
- **`delivery/`**: Lapisan luar yang berhadapan dengan klien. Biasanya berupa sub-direktori `http/` yang berisi HTTP handler dan pendaftaran router menggunakan framework Fiber.
- **`module.go`**: Berkas integrasi Uber Fx. Berkas ini menggunakan `fx.Module` untuk mendaftarkan konstruktor repository, usecase, handler, serta router group ke dalam siklus hidup (lifecycle) aplikasi agar dapat diinjeksi secara otomatis saat server dinyalakan.

---

### 2.3. Arsitektur Vue 3 Frontend (`Farmease`)
Frontend peternakan dibangun menggunakan Vue 3, Vite, dan TypeScript. Seluruh halaman utama dan fungsionalitas UI diimplementasikan menggunakan syntax **TSX (TypeScript XML)**, bukan template SFC `.vue` standar.

#### Visualisasi Struktur Folder Frontend:
```text
Farmease/
├── src/
│   ├── modules/          # Folder modular berbasis peran/fitur
│   │   ├── admin/        # Menu & Dasbor Admin
│   │   ├── ternak/       # Menu Operator Ternak
│   │   │   ├── assets/   # Stylesheet khusus (.css)
│   │   │   ├── components/# Komponen UI khusus ternak
│   │   │   ├── layouts/  # Tata letak / navbar ternak
│   │   │   ├── views/    # Halaman utama ternak (.tsx)
│   │   │   ├── router.ts # Sub-rute ternak
│   │   │   └── index.ts  # Ekspor modul ternak
│   │   └── pemilik/      # Menu Pemilik Ternak
│   ├── shared/           # Asset dan kode yang digunakan bersama
│   │   ├── api/          # HTTP Clients & Services (auth, peternakan, perkebunan)
│   │   ├── ui/           # Komponen UI reusable (buttons, modals)
│   │   └── composables/  # Vue Composables
│   ├── store/            # State management (Pinia)
│   ├── router/           # Routing utama & SSO Auth Guard (index.ts)
│   ├── App.tsx           # Komponen root aplikasi
│   └── main.ts           # Titik masuk aplikasi
├── vite.config.ts        # Konfigurasi Vite
└── package.json          # Dependensi frontend
```

#### Struktur Utama `Farmease/src`:
1. [modules](../Farmease/src/modules): Mengikuti pendekatan modular berbasis fitur/peran pengguna:
   - `admin/`: Modul dasbor dan pengelolaan level tinggi untuk Administrator.
   - `ternak/`: Modul utama pencatatan aktivitas domba, kesehatan, pakan, perkawinan, dan dasbor kandang.
   - `pemilik/`: Modul ringkasan laporan dan performa ternak untuk Pemilik.
2. [shared](../Farmease/src/shared): Utility bersama yang digunakan lintas modul:
   - `api/`: Berisi API Client (`client.ts`), otentikasi (`auth.ts`), API peternakan (`peternakan.ts`), dan API integrasi perkebunan (`perkebunan.ts`).
   - `ui/`: Komponen UI reusable (button, input, modal, dll).
   - `composables/`: Vue composables fungsi utilitas reaktif.
3. [store](../Farmease/src/store): State management global (Pinia) untuk mengelola otentikasi sesi dan navigasi.
4. [router](../Farmease/src/router): Router utama Vue Router yang menggabungkan rute-rute dari masing-masing modul (`adminRoutes`, `ternakRoutes`, `pemilikKebunRoutes`).

#### Detail Organisasi di dalam Modul (`src/modules/ternak/`):
- `views/`: Komponen halaman utama (contoh: `DashboardView.tsx`, `RecordFormView.tsx`).
- `components/`: UI sub-komponen (contoh: `fields/FeedStockFields.tsx` untuk input dinamis).
- `layouts/`: Kerangka tata letak halaman (contoh: `TernakLayout.tsx` yang membungkus sidebar navigasi).
- `router.ts`: Mendefinisikan sub-rute modul ternak (seperti `/ternak`, `/ternak/dasbor`, `/ternak/riwayat`, dll).
- `assets/css/`: File stylesheet Vanilla CSS.
- `index.ts`: Pintu ekspor modul ke luar.

---

### 2.4. Mekanisme Integrasi & Sesi
1. **SSO Authentication Guard**:
   Sistem otentikasi terintegrasi secara Single Sign-On (SSO). Apabila pengguna membuka modul Peternakan tanpa token sesi di LocalStorage, guard di [router/index.ts](../Farmease/src/router/index.ts) akan secara otomatis mengalihkan pengguna ke SSO Portal (`http://localhost:3000/?service=ternak`).
   Setelah login berhasil, SSO akan mengalihkan kembali pengguna ke modul Peternakan dengan membawa parameter sesi (`token`, `role`, `username`, `code`) di URL Query. Parameter tersebut ditangkap, disimpan ke LocalStorage via `authApi.setAuth`, dan dibersihkan dari bilah URL untuk menjaga keamanan sesi.
2. **Event-Driven Integration (RabbitMQ)**:
   Modul Peternakan bertindak sebagai konsumen (*consumer*) pesan dari broker RabbitMQ. Ketika modul Perkebunan backend mengirimkan event pemangkasan sisa panen (misalnya daun alpukat, daun kelengkeng, atau gulma/rumput liar), modul Peternakan menangkap event tersebut secara asinkron dan secara otomatis menambahkan jumlah stok pakan ternak di gudang logistik (`logistics.feeds`).

---

## 3. Persiapan Lingkungan (Prerequisites)

Sebelum menjalankan sistem, pastikan perangkat Anda telah terinstal:
- **Docker Desktop** (untuk menjalankan seluruh layanan Database, Redis, RabbitMQ, Backend, dan Frontend di dalam kontainer).
- **Go Compiler** (versi 1.20 atau yang lebih baru - jika ingin menjalankan di luar Docker/native).
- **Node.js** (versi 20 atau yang lebih baru) & **npm** (jika ingin menjalankan di luar Docker/native).

---

## 4. Konfigurasi Database & Infrastruktur

Seluruh kontainer diatur secara independen menggunakan Docker Compose di dalam sub-direktori masing-masing modul. Database PostgreSQL lokal akan secara otomatis membuat skema database utama saat pertama kali menyala:
- `farmease_sso` (dikelola oleh kontainer database SSO)
- `farmease_peternakan` (dikelola oleh kontainer database Peternakan)

---

## 5. Cara Menjalankan Sistem secara Lokal (Menggunakan Docker Compose)

Modul Peternakan dan SSO dapat dijalankan baik secara **mandiri** (per modul) maupun secara **bersamaan** dari direktori root proyek menggunakan fitur Docker Compose Shared Network.

### 5.1. Membuat Shared Network Docker (Satu Kali)
Sebelum menjalankan layanan (baik mandiri maupun gabungan), pastikan shared network sudah terbuat di terminal Anda:
```bash
docker network create farmease_shared_network
```

### 5.2. Opsi A: Menjalankan Seluruh Modul Sekaligus (Sangat Direkomendasikan)
Untuk menjalankan seluruh sistem (SSO, Peternakan, dan Perkebunan) sekaligus tanpa harus berpindah direktori, jalankan perintah berikut langsung dari **direktori root proyek**:
```bash
docker compose up -d
```
*Docker Compose di root akan memicu proses `include` untuk membaca file konfigurasi mandiri masing-masing modul dan meluncurkannya bersama-sama.*

### 5.3. Opsi B: Menjalankan Layanan secara Mandiri
Apabila Anda ingin menjalankan modul secara terisolasi (misalnya hanya SSO dan Peternakan):

1. **Jalankan modul SSO**:
   ```bash
   cd sso-be
   docker compose up -d
   ```
2. **Jalankan modul Peternakan (Ternak)**:
   Buka terminal baru, masuk ke direktori Peternakan backend dan jalankan Docker Compose:
   ```bash
   cd Farmease-BE
   docker compose up -d
   ```

### 5.4. Detail Port Layanan yang Terbuka
- **Portal SSO (Frontend)**: `http://localhost:3000`
- **Portal Peternakan (Ternak)**: `http://localhost:3001`
- **SSO Backend API**: `http://localhost:8080`
- **Peternakan Backend API**: `http://localhost:8081`

### 5.5. Menghentikan Layanan
*   Jika dijalankan sekaligus dari root:
    ```bash
    docker compose stop
    ```
*   Jika dijalankan mandiri: Jalankan `docker compose stop` dari dalam direktori modul bersangkutan.

---

## 6. Manajemen Migrasi & Reset Data (Database Migration)

Apabila skema database berubah atau Anda ingin membersihkan database Peternakan dari data lama untuk memuat data pengujian baru:

### 6.1. Reset dan Jalankan Ulang Database & Seeder
Masuk ke direktori `Farmease-BE` di terminal Anda dan jalankan perintah:
```bash
# 1. Hentikan seluruh kontainer dan hapus volume database peternakan
docker compose down -v

# 2. Jalankan kembali kontainer dan jalankan migrasi segar + seeder otomatis
docker compose up -d

# 3. Jalankan penyuntikan seeder secara manual jika diperlukan ulang
docker compose run --rm peternakan_seeder
```
*(Lakukan langkah serupa di dalam direktori `sso-be` untuk mereset modul SSO dengan menjalankan seeder `sso_seeder`).*

---

## 7. Pengujian Sistem Peternakan (Testing Guide)

Pengujian unit backend dan frontend dapat dijalankan langsung menggunakan perintah standar masing-masing teknologi (tanpa skrip wrapper tambahan):

### 7.1. Pengujian Unit Go Backend
1. **Pengujian Unit Modul SSO**:
   ```bash
   cd sso-be/sso
   go test ./...
   ```
2. **Pengujian Unit Modul Peternakan**:
   ```bash
   cd Farmease-BE/farmease
   go test ./...
   ```
3. **Pengujian Modul Spesifik (misal: cages)**:
   ```bash
   cd Farmease-BE/farmease
   go test -v ./module/cages/usecase
   ```

### 7.2. Pengujian Frontend Vue 3 (di direktori `Farmease`)
```bash
cd Farmease
# Menjalankan Uji Unit Frontend
npm run test:unit

# Menjalankan Uji E2E (Playwright)
npm run test:e2e
```

---

## 8. Diagram Alur & Desain Terkait
Untuk dokumentasi visual arsitektur perangkat lunak, silakan merujuk ke berkas Markdown berikut di direktori `docs`:
- [Desain Arsitektur / Sequence Diagram Peternakan](livestock_architecture_sequence_diagram.md) - Menjelaskan alur integrasi pakan dari perkebunan via RabbitMQ dan alur persetujuan Admin.
- [Class Diagram Peternakan](livestock_class_diagram.md) - Relasi antar model domain OOP (Domba, Kandang, Pakan, Pemeriksaan Birahi, Rekam Medis, dll).
- [Use Case Diagram Peternakan](livestock_usecase_diagram.md) - Pembagian fungsionalitas aktor Pemilik, Admin, dan Operator.
- [Sequence Diagram Modular Peternakan](livestock_module_sequence_diagrams.md) - Rincian urutan interaksi setiap *Use Case*.
