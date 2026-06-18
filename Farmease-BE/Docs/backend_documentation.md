# Dokumentasi Sistem Backend (Farmease BE)

Dokumentasi ini menjelaskan arsitektur, modul-modul, skema basis data, serta logika bisnis inti dari **Farmease Backend** (Sistem Informasi Peternakan Domba Say Hai Agro Farm).

---

## 1. Arsitektur Kode & Desain Sistem

Sistem backend dikembangkan menggunakan bahasa **Go** dengan framework **Fiber** dan database **PostgreSQL**. Struktur kode menerapkan pendekatan modular dengan pemisahan tanggung jawab yang terinspirasi dari **Clean Architecture**:

Setiap modul di dalam direktori `farmease/module/` memiliki struktur internal sebagai berikut:
- **`domain/`**: Menyimpan definisi struct data (model), request/response body, dan interface repository serta usecase.
- **`repository/postgresql/`**: Implementasi akses database PostgreSQL menggunakan driver `pgx/v5` dan pooling koneksi.
- **`usecase/`**: Lapisan logika bisnis utama (business logic layer) tempat keputusan transaksional dan orkestrasi antar-modul didefinisikan.
- **`delivery/http/`**: Router dan handler HTTP (controller) yang menerima input request JSON/Query parameter, memicu usecase, dan mengembalikan response terstandar.

---

## 2. Modul-Modul Sistem

Backend dibagi menjadi modul-modul berikut untuk mengelola operasional farm secara modular:
1. **`auth`**: Mengelola otentikasi user terintegrasi dengan Single Sign-On (SSO).
2. **`farms`**: Mengelola profil data peternakan/lahan.
3. **`cages`**: Mengelola kandang ternak di dalam lahan, termasuk monitoring kapasitas dan statistik populasi kandang.
4. **`sheep`**: Inti data ternak domba. Mengelola silsilah (pedigree/genealogy), identitas domba, riwayat perpindahan kandang, serta registrasi *pejantan donor eksternal* (`status='eksternal'`).
5. **`weights`**: Riwayat penimbangan berat badan ternak secara berkala.
6. **`healths`**: Riwayat rekam medis, diagnosis penyakit, pengobatan, vaksinasi, dan pemberian vitamin domba.
7. **`feeds`**: Manajemen stok pakan gudang (penerimaan pakan, konversi pakan mentah dari kebun menjadi pakan cacah) dan pencatatan log pemberian pakan harian.
8. **`manures`**: Pencatatan produksi kotoran kandang, riwayat fermentasi, dan alokasi pupuk organik ke perkebunan atau penjualan luar.
9. **`breedings`**: Manajemen perkawinan (alami & inseminasi buatan / IB), pencatatan batch straw semen, nama inseminator, waktu pelaksanaan, serta deteksi risiko kawin sedarah (inbreeding).
10. **`pregnancies`**: Pelacakan status kebuntingan indukan, hasil pemeriksaan berkala (pregnancy check), pencatatan kelahiran (litter), dan auto-pendaftaran profil anakan domba baru.
11. **`tasks`**: Worklist operasional operator harian ("Tugas Rutin").
12. **`routine_schedules`**: Template jadwal operasional berulang (harian, mingguan, bulanan) yang secara otomatis men-generate baris pekerjaan di tabel `tasks`.
13. **`notifications`**: Sistem notifikasi real-time untuk memberi tahu operator mengenai tugas yang akan datang atau peringatan kehamilan.

---

## 3. Skema Database Inti (PostgreSQL)

Database dipisahkan secara logis menggunakan skema PostgreSQL. Tabel-tabel utama yang saling berhubungan dalam modul breeding dan operasional adalah:

### A. Tabel Ternak (`livestock.sheep`)
Menyimpan data fisik individu domba.
- `id_sheep` (UUID, PK)
- `sheep_code` (VARCHAR, Unique) - ID identitas domba di farm.
- `sheep_name` (VARCHAR)
- `gender` (livestock.gender_enum: `jantan`, `betina`)
- `status` (livestock.sheep_status_enum: `aktif`, `hamil`, `dijual`, `mati`, `disembelih`, `eksternal`)
  - Status `eksternal` mewakili baris pejantan stub (donor semen luar) agar relasi silsilah (pedigree) tidak melanggar foreign key constraint.
- `id_father` & `id_mother` (UUID, FK) - Referensi rekursif silsilah keluarga domba.

### B. Tabel Perkawinan (`breeding.matings`)
Menyimpan riwayat perkawinan domba.
- `id_mating` (UUID, PK)
- `id_sheep_male` & `id_sheep_female` (UUID, FK)
- `mating_date` (DATE/TIMESTAMP)
- `mating_method` (breeding.mating_method_enum: `alami`, `ib`)
- `status` (breeding.mating_status_enum: `proses`, `sukses`, `gagal`)
- `inbreeding_flag` (BOOLEAN) & `coefficient_of_inbreeding` (DECIMAL)
- `straw_code` & `inseminator` (VARCHAR, Nullable) - Kolom tambahan khusus untuk metode Inseminasi Buatan (IB).

### C. Tabel Kebuntingan (`breeding.pregnancies`)
Menyimpan status kebuntingan indukan betina.
- `id_pregnancy` (UUID, PK)
- `id_mating` (UUID, FK)
- `pregnancy_date` (DATE)
- `pregnancy_status` (breeding.pregnancy_status_enum: `dikandung`, `melahirkan`, `keguguran`)
- `expected_birth_date` (DATE) - Estimasi tanggal lahir (default 148 hari dari tanggal mating).

### D. Tabel Tugas Pekerjaan (`operations.tasks`)
Menyimpan antrean tugas rutin harian operator.
- `id_task` (UUID, PK)
- `title` & `description` (TEXT)
- `task_date` (TIMESTAMP WITH TIME ZONE)
- `status` (operations.task_status_enum: `pending`, `selesai`)
- `category` (operations.task_category_enum: `perkawinan`, `kelahiran`, `pakan`, etc.)
- `rincian` (operations.task_rincian_enum: `Kontrol Kebuntingan`, `Inseminasi Buatan`, `Pencatatan Kelahiran`, etc.)
- `id_mating` (UUID, FK, Nullable) - Jembatan relasi agar tugas kontrol/kelahiran terhubung langsung ke data breeding yang relevan.

---

## 4. Alur & Logika Bisnis Utama

Sistem backend ini mengorkestrasi siklus reproduksi domba secara semi-otomatis melalui rantai tugas (*task chaining*):

### A. Perkawinan & Deteksi Inbreeding
1. Ketika perkawinan dicatat (`POST /api/matings`):
   - Jika metode adalah `ib` dengan donor luar, backend secara otomatis mendaftarkan/mencari pejantan stub dengan status `eksternal` di tabel `livestock.sheep`.
   - Mengambil data silsilah domba jantan dan betina, lalu menghitung koefisien inbreeding (**Coefficient of Inbreeding - CoI**) menggunakan rumus jalur Wright's (Wright's Path Coefficient) hingga 5 generasi ke atas.
   - Jika hasil perhitungan CoI $\ge 6.25\%$ (`inbreeding_flag = true`), sistem memberikan peringatan / menolak perkawinan tersebut guna mencegah cacat genetik pada anakan.
2. Setelah perkawinan disimpan dengan sukses:
   - Status perkawinan diset ke `proses`.
   - Backend **secara otomatis men-generate tugas baru** di tabel `operations.tasks` dengan jenis `Kontrol Kebuntingan` untuk **21 hari** setelah tanggal perkawinan (`mating_date + 21 hari`).

### B. Siklus Kontrol Kebuntingan
Ketika operator melakukan pemeriksaan kehamilan domba (`POST /api/pregnancies/check`):
1. **Hasil `bunting_terkonfirmasi`**:
   - Backend membuat baris baru di `breeding.pregnancies` dengan status `dikandung`.
   - Status domba betina diubah menjadi `hamil`.
   - Tandai tugas saat ini selesai (`status='selesai'`).
   - **Auto-generate tugas baru** `Pencatatan Kelahiran` diatur pada tanggal estimasi kelahiran (`expected_birth_date = mating_date + 148 hari`).
2. **Hasil `masih_menunggu`**:
   - Tandai tugas saat ini selesai (`status='selesai'`).
   - **Auto-generate tugas baru** `Kontrol Kebuntingan` lanjutan untuk **21 hari** ke depan dari tanggal pemeriksaan ini guna memastikan hasil final di kemudian hari.
3. **Hasil `gagal` (tidak bunting)**:
   - Status perkawinan di-update menjadi `gagal`.
   - Status domba betina dikembalikan menjadi `aktif`.
   - Tandai tugas selesai (`status='selesai'`). Siklus reproduksi selesai tanpa melahirkan.
4. **Hasil `keguguran`**:
   - Status kebuntingan di `breeding.pregnancies` di-update menjadi `keguguran`.
   - Status perkawinan di `breeding.matings` di-update menjadi `gagal`.
   - Status domba betina dikembalikan menjadi `aktif`.
   - Tandai tugas selesai (`status='selesai'`).

### C. Pencatatan Kelahiran
Ketika operator mengisi tugas kelahiran (`POST /api/births`):
- Menyimpan detail kelahiran di tabel `breeding.births`.
- Mengubah status kebuntingan menjadi `melahirkan` dan status perkawinan terkait menjadi `sukses`.
- Mengubah status induk betina kembali menjadi `aktif`.
- **Secara otomatis mendaftarkan profil domba anakan baru** ke tabel `livestock.sheep` dengan mengisi field `id_father` dan `id_mother` secara presisi dari data perkawinan terkait agar rantai silsilah (pedigree) terus berlanjut.
- Tandai tugas pencatatan kelahiran selesai (`status='selesai'`).
