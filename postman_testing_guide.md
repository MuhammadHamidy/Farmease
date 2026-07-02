# Panduan API Testing FARMease — Postman (Berdasarkan Modul Web)
> Panduan ini disusun berdasarkan alur halaman dan modul pada antarmuka web Farmease. Memudahkan pengujian endpoint backend yang dipanggil oleh setiap form pencatatan, peninjauan admin, deteksi inbreeding, dan pengelolaan gudang.

---

## Bagian 0: Setup Environment Postman

### A. Buat Environment: "FARMease Local"

| Variable   | Value                   | Keterangan                                   |
|------------|---------|----------------------------------------------|
| `base_url` | `http://localhost:8081` | Port default backend peternakan (`Farmease-BE`) |
| `token`    | *(kosong, diisi auto)*  | JWT Token dari hasil login                   |

### B. Simpan Token Otomatis
Pada request **Login**, buka tab **Tests** di Postman dan masukkan kode berikut:
```javascript
const res = pm.response.json();
if (res.token) {
    pm.environment.set("token", res.token);
    console.log("Token JWT berhasil disimpan:", res.token);
}
```

### C. Konfigurasi Authorization
Di Postman, atur **Authorization** pada tingkat folder koleksi:
- **Type**: `Bearer Token`
- **Token**: `{{token}}`

---

## Bagian 1: Modul SSO & Autentikasi (Halaman Login)

Menangani masuknya operator atau admin ke dalam sistem Farmease.

### [1.1] Login Akun
* **Method & URL**: `POST {{base_url}}/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
```json
{
  "username": "operator_ternak",
  "password": "password123"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.signature",
  "expires_at": "2026-06-30T18:00:00Z",
  "account": {
    "id_account": "uuid-akun-operator",
    "username": "operator_ternak",
    "id_role": "00000000-0000-0000-0000-000000000003",
    "operator_category": "ternak",
    "farm_id": "uuid-farm"
  }
}
```

---

## Bagian 2: Modul Dasbor Utama (Dashboard View)

Memuat ringkasan populasi, grafik berat badan, grafik kepadatan kandang, serta daftar tugas rutin operator.

### [2.1] Mengambil Data Ringkasan Populasi & Statistik
* **Method & URL**: `GET {{base_url}}/api/cages/uuid-kandang-a/stats`
* **Response (200 OK)**:
```json
{
  "total_sheep": 42,
  "male_sheep": 12,
  "female_sheep": 30,
  "pregnant_sheep": 5,
  "sick_sheep": 2,
  "average_weight": 35.8
}
```

### [2.2] Mengambil Data Tren Rata-rata Berat Badan
* **Method & URL**: `GET {{base_url}}/api/cages/uuid-kandang-a/weight-stats`
* **Response (200 OK)**:
```json
[
  { "month": "Januari", "average_weight": 32.5 },
  { "month": "Februari", "average_weight": 33.1 },
  { "month": "Maret", "average_weight": 34.2 },
  { "month": "April", "average_weight": 35.8 }
]
```

### [2.3] Mengambil Daftar Tugas Rutin Operator
* **Method & URL**: `GET {{base_url}}/api/tasks`
* **Response (200 OK)**:
```json
[
  {
    "id_task": "uuid-tugas-1",
    "title": "Penyiraman Rutin Lahan Alpukat",
    "description": "Siram secukupnya pagi ini",
    "status": "pending",
    "priority": "tinggi",
    "category": "penyiraman"
  },
  {
    "id_task": "uuid-tugas-2",
    "title": "Pemberian Pakan Kandang A",
    "description": "Berikan 20 kg rumput odot",
    "status": "pending",
    "priority": "tinggi",
    "category": "pakan"
  }
]
```

### [2.4] Menyelesaikan Tugas Rutin
* **Method & URL**: `PUT {{base_url}}/api/tasks/uuid-tugas-1/complete`
* **Body (JSON)**: *(Tidak membutuhkan Request Body)*
* **Response (200 OK)**:
```json
{
  "message": "Tugas berhasil diselesaikan",
  "id_task": "uuid-tugas-1",
  "id_submission": "sub-task-uuid-tugas-1",
  "detail": "Menyelesaikan tugas: Penyiraman Lahan Alpukat",
  "status": "menunggu persetujuan admin"
}
```
* **Keterangan**: *Menyelesaikan tugas akan merubah status tugas menjadi `"menunggu"` (dalam antrean persetujuan) dan mencatat log aktivitas pada sistem notifikasi. Status tugas akan berubah menjadi `"done"` (disetujui) secara otomatis setelah Admin menyetujui laporan submission yang bersangkutan.*

---

## Bagian 3: Modul Daftar Ternak & Kandang (Livestock & Cages Overview)

Menangani pencarian domba, filter kandang/kondisi, penambahan populasi baru, dan melihat silsilah/COI.

### [3.1] Filter dan Cari Domba
* **Method & URL**: `GET {{base_url}}/api/sheep?search=DM&status=Sehat`
* **Response (200 OK)**:
```json
[
  {
    "id_sheep": "uuid-domba-1",
    "sheep_code": "DM-001",
    "sheep_name": "Garut Super",
    "gender": "jantan",
    "status": "Sehat",
    "type": "Garut"
  },
  {
    "id_sheep": "uuid-domba-2",
    "sheep_code": "DM-002",
    "sheep_name": "Garut Indah",
    "gender": "betina",
    "status": "Sehat",
    "type": "Garut"
  }
]
```

### [3.2] Tambah Populasi Domba Baru (Form Tambah Domba)
* **Method & URL**: `POST {{base_url}}/api/sheep`
* **Body (JSON)**:
```json
{
  "sheep_code": "DM-099",
  "sheep_name": "Garut Indah",
  "gender": "betina",
  "date_of_birth": "2025-05-10",
  "status": "Sehat",
  "origin": "internal",
  "id_cage": "uuid-kandang-a",
  "id_type": "uuid-tipe-garut"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Domba berhasil didaftarkan",
  "id_sheep": "uuid-domba-baru-dibuat"
}
```

### [3.3] Lihat Silsilah Domba (Genealogy View)
* **Method & URL**: `GET {{base_url}}/api/sheep/uuid-domba-1/genealogy`
* **Response (200 OK)**:
```json
{
  "sheep": { "id_sheep": "uuid-domba-1", "sheep_code": "DM-001" },
  "father": { "id_sheep": "uuid-bapak", "sheep_code": "DM-FATHER" },
  "mother": { "id_sheep": "uuid-induk", "sheep_code": "DM-MOTHER" },
  "offspring": [
    { "id_sheep": "uuid-anak-1", "sheep_code": "DM-CHILD-1" }
  ]
}
```

---

## Bagian 4: Modul Form Pencatatan Operator (Record Forms)

Setiap pengisian form pencatatan oleh operator akan dikirim terlebih dahulu sebagai **Submission** (persetujuan pending) sebelum disetujui admin.

### [4.1] Form Pencatatan Birahi
* **Method & URL**: `POST {{base_url}}/api/submissions`
* **Body (JSON)**:
```json
{
  "type": "pencatatan_birahi",
  "typeLabel": "Pencatatan Birahi",
  "operatorCode": "OP01",
  "operatorName": "Budi Operator",
  "cageCode": "KA",
  "scope": "individu",
  "summary": "Domba betina DM-022 dicatat masuk masa birahi",
  "payload": {
    "id_sheep": "uuid-domba-betina",
    "tanggal_birahi": "2026-06-30",
    "catatan": "Menunjukkan gejala gelisah, vulva kemerahan"
  },
  "submittedAt": "2026-06-30T09:00:00Z",
  "approvalStatus": "pending"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Laporan birahi berhasil dikirim dan menunggu persetujuan",
  "id_submission": "uuid-submission-birahi"
}
```

### [4.2] Form Kawin Alam
* **Method & URL**: `POST {{base_url}}/api/submissions`
* **Body (JSON)**:
```json
{
  "type": "kawin_alam",
  "typeLabel": "Kawin Alam",
  "operatorCode": "OP01",
  "operatorName": "Budi Operator",
  "cageCode": "KA",
  "scope": "individu",
  "summary": "Perkawinan alam domba betina DM-022 dengan pejantan DM-011",
  "payload": {
    "id_sheep_female": "uuid-domba-betina",
    "id_sheep_male": "uuid-domba-jantan",
    "tanggal_kawin": "2026-06-30",
    "catatan": "Kandang koloni A, terpantau lancar"
  },
  "submittedAt": "2026-06-30T09:10:00Z",
  "approvalStatus": "pending"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Laporan kawin alam berhasil diajukan",
  "id_submission": "uuid-submission-kawin-alam"
}
```

### [4.3] Form Inseminasi Buatan (IB)
* **Method & URL**: `POST {{base_url}}/api/submissions`
* **Body (JSON)**:
```json
{
  "type": "inseminasi_buatan",
  "typeLabel": "Inseminasi Buatan",
  "operatorCode": "OP01",
  "operatorName": "Budi Operator",
  "cageCode": "KA",
  "scope": "individu",
  "summary": "Inseminasi Buatan pada betina DM-022 dengan Semen Batch SM-99",
  "payload": {
    "id_sheep_female": "uuid-domba-betina",
    "semen_batch": "SM-99",
    "inseminator_name": "Drh. Anton",
    "tanggal_ib": "2026-06-30",
    "catatan": "Semen cair impor"
  },
  "submittedAt": "2026-06-30T09:15:00Z",
  "approvalStatus": "pending"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Laporan inseminasi buatan berhasil diajukan",
  "id_submission": "uuid-submission-ib"
}
```

### [4.4] Form Kontrol Kebuntingan
* **Method & URL**: `POST {{base_url}}/api/submissions`
* **Body (JSON)**:
```json
{
  "type": "kontrol_kebuntingan",
  "typeLabel": "Kontrol Kebuntingan",
  "operatorCode": "OP01",
  "operatorName": "Budi Operator",
  "cageCode": "KA",
  "scope": "individu",
  "summary": "Cek kebuntingan DM-022 menggunakan metode Cek USG: Hamil",
  "payload": {
    "id_mating": "uuid-perkawinan-aktif",
    "id_sheep_female": "uuid-domba-betina",
    "check_date": "2026-06-30",
    "check_method": "Cek USG",
    "result": "Hamil",
    "notes": "Terlihat detak jantung fetus 1 ekor"
  },
  "submittedAt": "2026-06-30T09:20:00Z",
  "approvalStatus": "pending"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Laporan kontrol kebuntingan berhasil diajukan",
  "id_submission": "uuid-submission-kebuntingan"
}
```

### [4.5] Form Kelahiran (Laporan Lahir)
* **Method & URL**: `POST {{base_url}}/api/submissions`
* **Body (JSON)**:
```json
{
  "type": "kelahiran",
  "typeLabel": "Kelahiran Anak",
  "operatorCode": "OP01",
  "operatorName": "Budi Operator",
  "cageCode": "KA",
  "scope": "individu",
  "summary": "Kelahiran 2 anak dari induk DM-022",
  "payload": {
    "id_pregnancy": "uuid-kebuntingan-aktif",
    "birth_date": "2026-06-30",
    "number_of_offspring": 2,
    "offspring_gender": "1 jantan, 1 betina",
    "offspring_condition": "Sehat",
    "notes": "Bobot lahir rata-rata 3.2 kg"
  },
  "submittedAt": "2026-06-30T09:25:00Z",
  "approvalStatus": "pending"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Laporan kelahiran berhasil diajukan",
  "id_submission": "uuid-submission-kelahiran"
}
```

### [4.6] Form Kematian / Penjualan Domba (Ubah Status)
* **Method & URL**: `PATCH {{base_url}}/api/sheep/uuid-domba-1/status`
* **Body (JSON)**:
```json
{
  "status": "mati"
}
```
* **Response (200 OK)**:
```json
{
  "message": "Status domba berhasil diupdate menjadi mati",
  "id_sheep": "uuid-domba-1",
  "status": "mati"
}
```

---

## Bagian 5: Modul Cek Potensi Inbreeding (COI Tool)

Digunakan pada form pencocokan perkawinan untuk mendeteksi risiko perkawinan sedarah sebelum kawin alam dilakukan.

### [5.1] Cek Risiko Inbreeding Pasangan Domba
* **Method & URL**: `POST {{base_url}}/api/matings/check-inbreeding`
* **Body (JSON)**:
```json
{
  "id_sheep_female": "uuid-domba-betina",
  "id_sheep_male": "uuid-domba-jantan"
}
```
* **Response (200 OK)**:
```json
{
  "id_male": "uuid-domba-jantan",
  "id_female": "uuid-domba-betina",
  "coefficient_of_inbreeding": 0.0625,
  "inbreeding_percentage": 6.25,
  "inbreeding_flag": true,
  "risk_category": "Ambang Batas",
  "risk_level": "medium",
  "recommendation": "Ambang batas (Sepupu pertama). Sebaiknya dihindari jika memungkinkan.",
  "common_ancestors": [
    {
      "id_sheep": "uuid-leluhur-bersama",
      "paths": ["jalur bapak", "jalur ibu"]
    }
  ]
}
```

---

## Bagian 6: Modul Gudang & Pengelolaan Fermentasi (Warehouse & Silage)

Mengelola stok pakan utama dan memantau log fermentasi silase.

### [6.1] Ambil Daftar Stok Gudang
* **Method & URL**: `GET {{base_url}}/api/feeds`
* **Response (200 OK)**:
```json
[
  {
    "id_feed": "uuid-pakan-1",
    "name": "Konsentrat Jagung",
    "amount": 1250.5,
    "unit": "kg"
  },
  {
    "id_feed": "uuid-pakan-2",
    "name": "Hijauan Rumput Odot",
    "amount": 800.0,
    "unit": "kg"
  }
]
```

### [6.2] Tambah/Kurangi Stok Bahan Pakan (Form Update Stok)
* **Method & URL**: `PATCH {{base_url}}/api/feeds/uuid-pakan-1/stock`
* **Body (JSON)**:
```json
{
  "amount": 250.0,
  "type": "add"
}
```
* **Response (200 OK)**:
```json
{
  "message": "Stok berhasil diupdate",
  "id_feed": "uuid-pakan-1",
  "new_amount": 1500.5
}
```

### [6.3] Mulai Konversi Fermentasi Baru (Mulai Fermentasi)
* **Method & URL**: `POST {{base_url}}/api/feeds/conversions`
* **Body (JSON)**:
```json
{
  "target_feed_name": "Silase Rumput Odot",
  "target_amount": 500.0,
  "unit": "kg",
  "notes": "Bahan utama rumput odot + dedak 5%"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Proses konversi fermentasi silase berhasil dimulai",
  "id_conversion": "uuid-konversi-silase-1",
  "status": "fermentasi"
}
```

### [6.4] Catat Log Perkembangan Fermentasi (Form Kelola Fermentasi)
* **Method & URL**: `POST {{base_url}}/api/fermentations/conversions/{id_conversion}/logs`
* **Body (JSON)**:
```json
{
  "status": "fermentasi",
  "ph_level": 4.1,
  "temperature": 28.5,
  "physical_condition": "Aroma asam manis wangi segar khas silase, warna hijau kecoklatan, tidak berlendir/menggumpal."
}
```
* **Response (201 Created)**:
```json
{
  "message": "Log perkembangan fermentasi berhasil ditambahkan",
  "id_log": "uuid-log-baru-dibuat"
}
```

---

## Bagian 7: Modul Persetujuan & Peninjauan Admin (Admin Approvals)

Halaman khusus admin untuk memvalidasi submission operator sebelum disetujui masuk sistem.

### [7.1] Ambil Antrean Laporan Tertunda
* **Method & URL**: `GET {{base_url}}/api/submissions?status=pending`
* **Response (200 OK)**:
```json
[
  {
    "id": "uuid-submission-1",
    "type": "kawin_alam",
    "typeLabel": "Kawin Alam",
    "operatorName": "Budi Operator",
    "cageCode": "KA",
    "summary": "Perkawinan alam domba betina DM-022 dengan pejantan DM-011",
    "submittedAt": "2026-06-30T09:10:00Z",
    "approvalStatus": "pending"
  }
]
```

### [7.2] Setujui Laporan Operator (Approve Submission)
* **Method & URL**: `PUT {{base_url}}/api/submissions/uuid-submission-1`
* **Body (JSON)**:
```json
{
  "approvalStatus": "approved",
  "reviewNote": "Formulir lengkap dan data penimbangan valid sesuai kondisi lapangan.",
  "reviewedBy": "uuid-admin-peninjau",
  "reviewedAt": 1719558600000
}
```
* **Response (200 OK)**:
```json
{
  "message": "Submission berhasil disetujui dan data resmi telah ditulis ke database utama",
  "id": "uuid-submission-1",
  "approvalStatus": "approved"
}
```
* **Efek Samping**: *Jika submission terikat pada tugas (memiliki `taskId`), status tugas di database otomatis berubah dari `"menunggu"` menjadi `"selesai"` (telah divalidasi).*

### [7.3] Tolak Laporan Operator (Reject Submission)
* **Method & URL**: `PUT {{base_url}}/api/submissions/uuid-submission-1`
* **Body (JSON)**:
```json
{
  "approvalStatus": "rejected",
  "reviewNote": "Nama pejantan tidak sesuai, harap periksa kembali kode ear tag.",
  "reviewedBy": "uuid-admin-peninjau",
  "reviewedAt": 1719558600000
}
```
* **Response (200 OK)**:
```json
{
  "message": "Submission berhasil ditolak",
  "id": "uuid-submission-1",
  "approvalStatus": "rejected"
}
```
* **Efek Samping**: *Jika submission terikat pada tugas (memiliki `taskId`), status tugas di database otomatis berubah/dikembalikan dari `"menunggu"` menjadi `"pending"` agar operator dapat mengerjakannya kembali.*
