# Master Panduan Deployment Ekosistem Farmease (SSO, Peternakan & Perkebunan)
### Domain Utama Contoh: `netrash.id` | Server: VPS Niagahoster (aaPanel)

Panduan ini berisi langkah runtut dari awal hingga akhir untuk mendeploy seluruh ekosistem **Farmease** (3 Backend Go + 3 Frontend Vue + 3 PostgreSQL DB + Redis + RabbitMQ) untuk lingkungan **Staging** dan **Production**.

---

## 📊 Tabel Acuan Port & Domain Ekosistem

| Modul & Service | 🧪 Staging Subdomain | Target Port Container Staging | 🚀 Production Subdomain | Target Port Container Production |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend SSO** | `sso-staging.netrash.id` | `http://127.0.0.1:3005` | `sso.netrash.id` | `http://127.0.0.1:3000` |
| **Backend API SSO** | `api-sso-staging.netrash.id` | `http://127.0.0.1:8085` | `api-sso.netrash.id` | `http://127.0.0.1:8080` |
| **Frontend Peternakan** | `staging-ternak.netrash.id` | `http://127.0.0.1:3006` | `netrash.id` *(atau `ternak.netrash.id`)* | `http://127.0.0.1:3001` |
| **Backend API Peternakan** | `api-ternak-staging.netrash.id` | `http://127.0.0.1:8086` | `api-ternak.netrash.id` | `http://127.0.0.1:8081` |
| **Frontend Perkebunan** | `kebun-staging.netrash.id` | `http://127.0.0.1:3007` | `kebun.netrash.id` | `http://127.0.0.1:3002` |
| **Backend API Perkebunan** | `api-kebun-staging.netrash.id` | `http://127.0.0.1:8087` | `api-kebun.netrash.id` | `http://127.0.0.1:8082` |

---

## 📌 LANGKAH 1: Pengaturan DNS Domain (Di Niagahoster / Cloudflare)

Sebelum mendaftarkan domain di aaPanel, arahkan seluruh domain & subdomain ke IP Public VPS Niagahoster Anda.

1. Buka **DNS Management** domain `netrash.id` di Niagahoster atau Cloudflare.
2. Tambahkan **A Record Wildcard** agar seluruh subdomain otomatis mengarah ke VPS:
   - **Type**: `A`
   - **Name / Host**: `*` *(tanda bintang)*
   - **Points to / IP Address**: `IP_PUBLIC_VPS_ANDA` (misal `103.xxx.xxx.xxx`)
   - **TTL**: Auto / 300
3. *(Atau buat A Record satu per satu untuk `sso-staging`, `api-sso-staging`, `staging-ternak`, `api-ternak-staging`, `kebun-staging`, `api-kebun-staging`)*.

---

## 📌 LANGKAH 2: Menjalankan Container Docker di Server VPS

Masuk ke **Terminal aaPanel** (atau via SSH):

### 🧪 Untuk Mengaktifkan Versi Staging:
```bash
cd /www/wwwroot/Farmease
git pull
docker-compose -f docker-compose.staging.yml up -d
```

### 🚀 Untuk Mengaktifkan Versi Production:
```bash
cd /www/wwwroot/Farmease
docker-compose -f docker-compose.prod.yml up -d
```

*Seluruh 11 container (3 FE, 3 BE, 3 DB, Redis, RabbitMQ) akan berjalan 24 jam di background.*

---

## 📌 LANGKAH 3: Pendaftaran Site di Menu Website aaPanel

Untuk setiap service di tabel di atas, daftarkan site di aaPanel:

1. Buka menu **Website** di aaPanel $\to$ Klik tombol **`Add site`**.
2. Isi form:
   - **Domain name**: Masukkan nama subdomain (misal: `staging-ternak.netrash.id`)
   - **PHP version**: Ubah menjadi **`Static`**
   - **FTP & Database**: Biarkan `Not create`
3. Klik tombol hijau **`Confirm`**.

---

## 📌 LANGKAH 4: Pengaturan Reverse Proxy (Arahkan ke Port Docker)

Setelah site terbuat di aaPanel:

1. Klik nama domain di daftar Website aaPanel (misal `staging-ternak.netrash.id`).
2. Di pop-up pengaturan, pilih menu **`Reverse Proxy`** $\to$ Klik **`Add reverse proxy`**.
3. Isi form:
   - **Proxy Name**: Isi nama singkat (misal `TernakFEStaging`)
   - **Proxy dir**: `/`
   - **Target URL**: Masukkan URL port container yang sesuai (misal: `http://127.0.0.1:3006`)
   - **Sent Domain**: `$host` *(wajib pakai tanda dollar $)*
4. Centang **`Enable reverse proxy`** $\to$ Klik **`Confirm` / `Save`**.

---

## 📌 LANGKAH 5: Pemasangan Sertifikat SSL HTTPS Gratis (Let's Encrypt)

Agar website aman (HTTPS) dan tidak muncul peringatan *Not Secure*:

1. Di bilah menu sebelah kiri aaPanel, pilih **`Domains`** $\to$ pilih tab **`SSL Certificate`** $\to$ sub-tab **`Let's Encrypt`**.
2. Klik tombol hijau **`Apply for SSL`**.
3. Pada pop-up form:
   - **Verification method**: Pilih **`File Verification`**
   - **Masukkan Domain**: Ketik nama domain/subdomain Anda (1 per baris)
4. Klik tombol hijau **`Apply Now`**.
5. Setelah SSL aktif, buka kembali pengaturan site di menu **Website** $\to$ centang sakelar **`Force HTTPS`**.

---

🎉 **SELESAI!** Seluruh ekosistem Farmease (SSO, Peternakan, Perkebunan) telah terhubung sempurna dan siap diakses publik di internet!
