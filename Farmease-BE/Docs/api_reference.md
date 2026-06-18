# API Reference Dokumentasi (Swagger & OpenAPI Spec)

Dokumentasi ini merangkum seluruh endpoint RESTful API yang didefinisikan dalam koleksi Postman, lengkap dengan metode HTTP, URL path, skema payload request, response sukses, dan deskripsi fungsinya.

---

## Informasi Umum & Autentikasi

Semua request (kecuali login) memerlukan token autentikasi JWT Bearer yang dikirim melalui header `Authorization`.

- **Base URL**: `http://localhost:8081` (Peternakan Service)
- **Header**:
  ```http
  Authorization: Bearer <token_jwt>
  Content-Type: application/json
  ```

---

## 1. Modul Autentikasi (`Auth`)

### POST `/api/auth/login`
Melakukan otentikasi user dan mendapatkan JWT Bearer token.

- **Request Body**:
  ```json
  {
    "username": "admin01",
    "password": "password123"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "expires_at": "2026-12-01T10:00:00Z",
    "akun": {
      "id_akun": 1,
      "username": "admin01",
      "kategori_operator": "admin",
      "role": {
        "id_role": 1,
        "nama_role": "Admin",
        "hak_akses": "full"
      }
    }
  }
  ```

---

## 2. Modul Akun & Role (`Akun`)

### GET `/api/akun`
Mendapatkan daftar semua akun operator dan admin. (Khusus Role Admin).

- **Response Sukses (200 OK)**:
  ```json
  [
    {
      "id_akun": 1,
      "username": "admin01",
      "kategori_operator": "admin"
    }
  ]
  ```

### POST `/api/akun`
Membuat akun operator baru. (Khusus Role Admin).

- **Request Body**:
  ```json
  {
    "username": "operator01",
    "password": "password123",
    "kategori_operator": "operator",
    "id_role": 2
  }
  ```

### GET `/api/role`
Mendapatkan daftar semua role dan konfigurasi hak akses.

- **Response Sukses (200 OK)**:
  ```json
  [
    {
      "id_role": 1,
      "nama_role": "Admin",
      "hak_akses": "full"
    }
  ]
  ```

---

## 3. Modul Kandang (`Cages`)

### GET `/api/kandang`
Mendapatkan daftar kandang yang aktif dengan filter opsional.

- **Query Parameters**:
  - `jenis_kandang` (string, opsional): `jantan`, `betina`, `campuran`, `pedet`
  - `page` (integer, opsional, default 1)
  - `per_page` (integer, opsional, default 20)
- **Response Sukses (200 OK)**:
  ```json
  [
    {
      "id_kandang": 1,
      "kode_kandang": "K-001",
      "kapasitas": 20,
      "jenis_kandang": "jantan",
      "jumlah_terisi": 15
    }
  ]
  ```

### POST `/api/kandang`
Membuat kandang baru.

- **Request Body**:
  ```json
  {
    "kode_kandang": "K-005",
    "kapasitas": 25,
    "jenis_kandang": "betina"
  }
  ```

### GET `/api/kandang/{id}`
Mendapatkan detail kandang tertentu lengkap dengan daftar domba di dalamnya.

- **Response Sukses (200 OK)**:
  ```json
  {
    "id_kandang": 1,
    "kode_kandang": "K-001",
    "kapasitas": 20,
    "jenis_kandang": "jantan",
    "domba": [
      {
        "id_domba": 5,
        "kode_domba": "D-005",
        "nama_domba": "Bejo",
        "status": "aktif"
      }
    ]
  }
  ```

### PUT `/api/kandang/{id}`
Memperbarui data kapasitas dan jenis kandang.

- **Request Body**:
  ```json
  {
    "kode_kandang": "K-001",
    "kapasitas": 30,
    "jenis_kandang": "jantan"
  }
  ```

### DELETE `/api/kandang/{id}`
Menghapus kandang. Penghapusan akan ditolak (409 Conflict) jika kandang masih berisi domba.

---

## 4. Modul Ternak Domba (`Sheep`)

### GET `/api/domba`
Mendapatkan daftar domba dengan filter fleksibel.

- **Query Parameters**:
  - `id_kandang` (integer, opsional)
  - `jenis_kelamin` (string, opsional): `jantan`, `betina`
  - `status` (string, opsional): `aktif`, `hamil`, `dijual`, `mati`, `disembelih`, `eksternal`
  - `page` (integer, default 1)
  - `per_page` (integer, default 20)
- **Response Sukses (200 OK)**:
  ```json
  [
    {
      "id_domba": 5,
      "kode_domba": "D-005",
      "nama_domba": "Bejo",
      "jenis_kelamin": "jantan",
      "tanggal_lahir": "2023-03-10",
      "status": "aktif",
      "asal": "lokal",
      "id_kandang": 1,
      "id_jenis": 2,
      "nama_jenis": "Garut",
      "berat_terakhir": 28.5
    }
  ]
  ```

### POST `/api/domba`
Mendaftarkan domba baru. Kapasitas kandang tujuan akan divalidasi otomatis.

- **Request Body**:
  ```json
  {
    "kode_domba": "D-010",
    "nama_domba": "Bejo Jr",
    "jenis_kelamin": "jantan",
    "tanggal_lahir": "2024-05-01",
    "status": "aktif",
    "id_kandang": 1,
    "id_jenis": 2,
    "asal": "lokal",
    "id_induk_jantan": null,
    "id_induk_betina": null
  }
  ```

### GET `/api/domba/{id}`
Mendapatkan detail profil domba lengkap beserta data timbangan terakhir dan silsilah langsung (father/mother).

### PUT `/api/domba/{id}`
Mengubah detail biodata domba atau melakukan mutasi kandang.

### PATCH `/api/domba/{id}/status`
Mengubah status hidup/jual/mati domba.

- **Request Body**:
  ```json
  {
    "status": "jual",
    "catatan": "Dijual ke pasar Cikaret"
  }
  ```

### GET `/api/domba/{id}/silsilah`
Mendapatkan pohon keluarga (pedigree tree) domba.
- **Query Parameters**:
  - `generasi` (integer, opsional, default 3, maks 5)

---

## 5. Modul Master Jenis Domba (`Sheep Types`)

### GET `/api/jenis-domba`
Daftar seluruh ras/jenis domba yang terdaftar.

### POST `/api/jenis-domba`
Menambah kategori ras domba baru.

- **Request Body**:
  ```json
  {
    "nama_jenis": "Merino",
    "deskripsi_jenis": "Domba impor penghasil wol"
  }
  ```

---

## 6. Modul Berat Badan (`Weights`)

### GET `/api/domba/{id}/berat-badan`
Mendapatkan seluruh histori timbangan berat badan domba tertentu.

### POST `/api/domba/{id}/berat-badan`
Mencatat hasil penimbangan berat badan baru. Entri baru akan memicu pembaruan kalkulasi pakan harian domba secara otomatis.

- **Request Body**:
  ```json
  {
    "tanggal_timbang": "2026-11-01",
    "berat_kg": 29.2,
    "catatan": "Kondisi sehat"
  }
  ```

---

## 7. Modul Kesehatan (`Healths`)

### GET `/api/domba/{id}/kesehatan`
Histori pemeriksaan medis dan tindakan pengobatan domba.

### POST `/api/domba/{id}/kesehatan`
Mencatat rekam medis atau tindakan pengobatan/vaksinasi baru.

- **Request Body**:
  ```json
  {
    "tanggal_periksa": "2026-11-01",
    "diagnosa": "Sehat",
    "tindakan": "Vaksinasi rutin",
    "obat_diberikan": "B-Complex",
    "nama_pemeriksa": "drh. Ari",
    "catatan": "Kondisi baik"
  }
  ```

---

## 8. Modul Pakan (`Feeds`)

### GET `/api/pakan/master`
Daftar stok pakan gudang saat ini.

### POST `/api/pakan/master`
Mendaftarkan jenis pakan baru ke sistem gudang.

- **Request Body**:
  ```json
  {
    "nama_pakan": "Rumput Gajah",
    "satuan": "kg",
    "stok_awal": 500.0,
    "harga_per_satuan": 2000,
    "kategori": "hijauan"
  }
  ```

### PATCH `/api/pakan/master/{id}/stok`
Menambah atau mengurangi stok gudang pakan secara manual.

- **Request Body**:
  ```json
  {
    "jumlah": 200,
    "tipe": "tambah",
    "catatan": "Pembelian batch baru"
  }
  ```

### GET `/api/pakan/rekomendasi/{id_domba}`
Menghitung estimasi kebutuhan pakan harian domba berdasarkan berat badan dan status kehamilan (10% BB untuk hijauan, 1.5% BB untuk konsentrat).

### GET `/api/pakan/rekomendasi/kandang/{id_kandang}`
Menjumlahkan total kebutuhan pakan harian seluruh domba dalam kandang.

### GET `/api/domba/{id}/pemberian-pakan`
Mendapatkan histori konsumsi pakan harian domba.

### POST `/api/domba/{id}/pemberian-pakan`
Mencatat pemberian pakan harian domba. Stok gudang akan berkurang secara otomatis.

- **Request Body**:
  ```json
  {
    "tanggal_pemberian": "2026-11-01",
    "id_pakan": 1,
    "jumlah": 3.0,
    "satuan": "kg",
    "catatan": ""
  }
  ```

---

## 9. Modul Kotoran Ternak (`Manures`)

### GET `/api/domba/{id}/kotoran`
Histori pembersihan dan pengumpulan kotoran ternak.

### POST `/api/domba/{id}/kotoran`
Mencatat aktivitas pengambilan kotoran kandang.

- **Request Body**:
  ```json
  {
    "jenis_kegiatan": "pengambilan",
    "jumlah": 5.0,
    "satuan": "kg",
    "catatan": ""
  }
  ```

---

## 10. Modul Deteksi Inbreeding (`Inbreeding`)

### POST `/api/perkawinan/cek-inbreeding`
Menguji tingkat kekerabatan pasangan sebelum dikawinkan.

- **Request Body**:
  ```json
  {
    "id_domba_jantan": 2,
    "id_domba_betina": 7
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "id_jantan": 2,
    "id_betina": 7,
    "coefficient_of_inbreeding": 0.125,
    "persen_kekerabatan": 12.5,
    "flag_sedarah": true,
    "level_risiko": "sedang",
    "leluhur_bersama": [
      {
        "id_domba": 1,
        "nama_domba": "Leluhur Utama",
        "jalur": ["jantan>bapak", "betina>ibu"]
      }
    ],
    "rekomendasi": "Perkawinan berisiko tinggi (inbreeding). Pertimbangkan pejantan lain."
  }
  ```

### GET `/api/inbreeding/laporan`
Mendapatkan laporan semua perkawinan sedarah yang terdeteksi di farm.

- **Query Parameters**:
  - `level_risiko` (string, opsional): `aman`, `sedang`, `tinggi`
  - `tanggal_dari` (string, opsional)

### POST `/api/inbreeding/saran-pasangan`
Mendapatkan saran daftar jodoh terbaik dengan CoI terkecil untuk domba tertentu.

- **Request Body**:
  ```json
  {
    "id_domba": 5,
    "batas_coi": 0.0625,
    "limit": 5
  }
  ```

---

## 11. Modul Perkawinan (`Breedings`)

### GET `/api/perkawinan`
Mendapatkan seluruh riwayat pencatatan perkawinan domba.

### POST `/api/perkawinan`
Merekam perkawinan baru. Mendukung metode perkawinan alami maupun Inseminasi Buatan (IB). Cek inbreeding otomatis dipicu saat menyimpan.

- **Request Body (Alami)**:
  ```json
  {
    "id_domba_jantan": 2,
    "id_domba_betina": 7,
    "tanggal_kawin": "2026-11-01",
    "metode_kawin": "alami",
    "status": "proses",
    "catatan": ""
  }
  ```
- **Request Body (IB dengan Donor Semen Luar)**:
  ```json
  {
    "id_domba_betina": 7,
    "tanggal_kawin": "2026-11-01T10:00:00Z",
    "metode_kawin": "ib",
    "status": "proses",
    "straw_code": "STR-B202611-X01",
    "inseminator": "Budi Santoso",
    "external_donor": {
      "name": "Pejantan Boer Premium",
      "origin": "BIB Lembang"
    },
    "catatan": ""
  }
  ```

### PATCH `/api/perkawinan/{id}/status`
Memperbarui status perkawinan secara manual.

- **Request Body**:
  ```json
  {
    "status": "gagal",
    "catatan": "Tidak bunting setelah dicek berulang"
  }
  ```

---

## 12. Modul Kehamilan (`Pregnancies`)

### POST `/api/kehamilan`
Mencatat status kehamilan indukan domba betina.

### GET `/api/kehamilan`
Mendapatkan daftar kehamilan indukan yang sedang aktif (`status_kehamilan='dikandung'`).

### POST `/api/pregnancies/check`
Mengisi hasil pemeriksaan kebuntingan (pregnancy check / Kontrol Kebuntingan).

- **Request Body**:
  ```json
  {
    "id_mating": "a1111111-1111-1111-1111-111111111101",
    "tanggal_pemeriksaan": "2026-11-22T08:00:00Z",
    "metode_pemeriksaan": "usg_palpasi",
    "hasil": "bunting_terkonfirmasi",
    "catatan": "Kantong kehamilan terlihat jelas",
    "id_task": "t1111111-1111-1111-1111-111111111102"
  }
  ```

---

## 13. Modul Kelahiran (`Births`)

### POST `/api/kelahiran`
Mencatat kelahiran anak domba dari kehamilan aktif. Menghubungkan silsilah anakan baru secara otomatis.

- **Request Body**:
  ```json
  {
    "id_kehamilan": 8,
    "tanggal_lahir": "2026-11-01",
    "jumlah_anak": 2,
    "jenis_kelamin_anak": "campuran",
    "kondisi_anak": "sehat",
    "catatan": "",
    "daftar_anak": [
      {
        "kode_domba": "D-NEW-01",
        "nama_domba": "Cempe Satu",
        "jenis_kelamin": "jantan",
        "id_kandang": 3
      },
      {
        "kode_domba": "D-NEW-02",
        "nama_domba": "Cempe Dua",
        "jenis_kelamin": "betina",
        "id_kandang": 3
      }
    ]
  }
  ```

---

## 14. Modul Tugas & Notifikasi (`Tasks & Notifications`)

### GET `/api/tasks`
Mendapatkan daftar tugas rutin milik operator yang aktif.

- **Query Parameters**:
  - `tanggal` (string, opsional): Filter by date YYYY-MM-DD
- **Response Sukses (200 OK)**:
  ```json
  [
    {
      "id_task": "t1111111-1111-1111-1111-111111111102",
      "judul": "Kontrol Kebuntingan - D-007",
      "deskripsi": "Pemeriksaan kebuntingan berkala setelah perkawinan",
      "tanggal": "2026-11-22T00:00:00Z",
      "status": "pending",
      "kategori": "perkawinan"
    }
  ]
  ```

### PATCH `/api/tasks/{id}/complete`
Menandai tugas rutin telah selesai dikerjakan (mengubah status menjadi `selesai`).

### GET `/api/notifications`
Mendapatkan daftar notifikasi sistem untuk user yang login.

### PATCH `/api/notifications/{id}/read`
Menandai notifikasi sistem telah dibaca (`is_read = true`).
