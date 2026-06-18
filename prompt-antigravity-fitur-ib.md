# Prompt untuk Antigravity — Fitur Pencatatan Perkawinan IB & Kontrol Kebuntingan

## Konteks Proyek

Sistem informasi peternakan domba berbasis web untuk Say Hai Agro Farm (Tugas Akhir S1):
- **Frontend**: Vue.js
- **Backend**: Go (Gin)
- **Database**: PostgreSQL
- **Metodologi**: Waterfall

Skema yang **sudah ada** (jangan diubah strukturnya kecuali sesuai instruksi migrasi di bawah):

- `master.cages`, `master.sheep_types`
- `livestock.sheep` (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status [`aktif|hamil|dijual|mati|disembelih`], origin, id_cage, id_type, id_father, id_mother, photo_url, created_by/updated_by) — **ini adalah sumber pedigree** untuk kalkulasi koefisien inbreeding (Wright's formula) lewat `id_father`/`id_mother`.
- `breeding.matings` (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method [`alami|ib`], status [`proses|sukses|gagal`], inbreeding_flag, coefficient_of_inbreeding, notes)
- `breeding.pregnancies` (id_pregnancy, id_mating, pregnancy_date, pregnancy_status [`dikandung|melahirkan|keguguran`], expected_birth_date, notes)
- `breeding.births` (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes)
- `operations.routine_schedules` — template jadwal aktivitas berulang (title, category, frequency, days_of_week, id_cage, rincian [enum `task_rincian_enum`, sudah berisi `'Kawin Alami'`, `'Inseminasi Buatan'`, `'Pencatatan Kelahiran'`, `'Pemeriksaan Anak & Induk'`, dll], is_active).
- `operations.tasks` — **ini tabel "aktivitas"**: instance pekerjaan konkret (title, description, task_date, status [enum `task_status_enum`: `belum|proses|selesai|terlambat|pending|done|menunggu`], priority, category, rincian, schedule_id, id_cage, id_account). Form "Isi Form Pencatatan" yang ada sekarang mengisi/menyelesaikan baris di tabel ini.
- `operations.notifications` (title, message, is_read, id_account, type).

## Masalah yang Harus Diselesaikan

1. `operations.tasks` tidak punya kolom referensi ke `breeding.matings`, jadi saat form IB/Kawin Alami/Kontrol Kebuntingan diisi dan disimpan, task hanya berubah status tanpa benar-benar tersambung ke data terstruktur breeding. Perlu jembatan eksplisit.
2. `task_rincian_enum` belum punya value `'Kontrol Kebuntingan'` — perlu ditambahkan supaya alur follow-up kebuntingan punya jenis aktivitas sendiri (terpisah dari `'Inseminasi Buatan'` dan `'Pencatatan Kelahiran'`).
3. IB butuh sumber pejantan yang bisa berupa **straw/donor eksternal** (tidak punya entri fisik di farm), padahal `breeding.matings.id_sheep_male` bersifat NOT NULL dan FK ke `livestock.sheep`.
4. Gestasi domba 144–152 hari (default estimasi **148 hari**) berarti hasil mating tidak diketahui langsung — perlu mekanisme reminder otomatis dan form follow-up bertahap (Kontrol Kebuntingan → Pencatatan Kelahiran), bukan satu kali input statis.

## Yang Harus Dibangun

### 1. Migrasi Database Tambahan

```sql
-- (a) Tambah value enum untuk jenis aktivitas baru
ALTER TYPE operations.task_rincian_enum ADD VALUE IF NOT EXISTS 'Kontrol Kebuntingan';

-- (b) Tambah value status pada livestock.sheep_status_enum untuk merepresentasikan
--     "stub" pejantan donor eksternal (bukan individu fisik di farm, hanya untuk pedigree/FK).
ALTER TYPE livestock.sheep_status_enum ADD VALUE IF NOT EXISTS 'eksternal';

-- (c) Kolom tambahan khusus IB di breeding.matings
ALTER TABLE breeding.matings ADD COLUMN IF NOT EXISTS straw_code VARCHAR(100) NULL;
ALTER TABLE breeding.matings ADD COLUMN IF NOT EXISTS inseminator VARCHAR(100) NULL;

-- (d) Jembatan task -> mating, supaya task follow-up tahu mating/pregnancy mana yang dirujuk
ALTER TABLE operations.tasks ADD COLUMN IF NOT EXISTS id_mating UUID NULL
    REFERENCES breeding.matings(id_mating) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_id_mating ON operations.tasks(id_mating);
```

> CATATAN UNTUK AGENT:
> - `ALTER TYPE ... ADD VALUE` tidak bisa dijalankan di dalam transaksi yang sama dengan query yang langsung memakai value baru tersebut (batasan PostgreSQL) — jalankan sebagai statement migrasi terpisah sebelum migrasi lain yang memakainya.
> - `task_status_enum` punya banyak value, tapi yang **benar-benar dipakai di aplikasi saat ini hanya `pending`** (label tampilan "Belum Dikerjakan") **dan `selesai`** (label tampilan "Selesai"). Value lain (`belum`, `proses`, `terlambat`, `done`, `menunggu`) adalah peninggalan enum awal dan tidak dipakai — jangan dipakai untuk kode baru, cukup gunakan `pending` untuk task baru dan `selesai` saat task diselesaikan.
> - Pejantan donor eksternal didaftarkan sebagai baris baru di `livestock.sheep` dengan `gender='jantan'`, `status='eksternal'`, `id_cage=NULL`, `id_father/id_mother=NULL` (founder), dan `origin` diisi teks bebas (misal "Donor Eksternal - Balai Inseminasi X"). Karena `status != 'aktif'` dan `id_cage IS NULL`, entri ini otomatis tidak muncul di query/dropdown "Domba Kandang Aktif" atau "Pejantan Dewasa Siap Kawin" yang sudah ada — pastikan filter existing memang berbasis `status='aktif'`, konfirmasi dulu sebelum mengandalkan ini.

### 2. Backend (Go + Gin)

- `POST /api/livestock/sheep/external-donor` — registrasi/lookup pejantan donor eksternal (insert ke `livestock.sheep` seperti dijelaskan di atas, idempotent berdasarkan kombinasi nama+asal supaya tidak duplikat tiap kali dipakai ulang).
- `POST /api/breeding/matings` — create mating record.
  - Body: `mating_method` (`alami`/`ib`), `id_sheep_female`, `mating_date`, `notes`, dan untuk pejantan: `id_sheep_male` (internal) **atau** objek `external_donor` (nama, asal, akan dipanggil ke endpoint donor eksternal di atas untuk dapat `id_sheep`).
  - Untuk `ib`: simpan juga `straw_code`, `inseminator` jika diisi.
  - Setelah simpan, hitung `inbreeding_flag` & `coefficient_of_inbreeding` via service Wright's formula menggunakan `id_father`/`id_mother` dari `livestock.sheep` milik kedua sire/dam (untuk donor eksternal yang tidak punya induk tercatat, hasilnya harus 0/false, bukan error — diperlakukan sebagai founder/unknown ancestor).
  - **Auto-generate task follow-up**: insert baris baru ke `operations.tasks` dengan `category='perkawinan'`, `rincian='Kontrol Kebuntingan'`, `id_mating=<id baru>`, `id_cage=<kandang betina>`, `task_date = mating_date + 21 hari` (jadikan offset ini konstanta yang bisa dikonfigurasi), `status='pending'`. Opsional: insert juga `operations.notifications` terkait.
- `POST /api/breeding/pregnancies/check` — endpoint untuk submit hasil "Kontrol Kebuntingan". Body: `id_mating`, `tanggal_pemeriksaan`, `metode_pemeriksaan` (`non_return_estrus|usg_palpasi|manual`), `hasil` (`masih_menunggu|bunting_terkonfirmasi|gagal|keguguran`), `catatan`, `id_task` (task yang sedang diselesaikan).
  - Jika `hasil = bunting_terkonfirmasi`: buat/update baris `breeding.pregnancies` (`pregnancy_status='dikandung'`, `expected_birth_date = mating_date + 148 hari` jika belum ada), tandai task ini selesai, **auto-generate task baru** `rincian='Pencatatan Kelahiran'` dengan `task_date = expected_birth_date`, `id_mating` sama.
  - Jika `hasil = masih_menunggu`: tandai task ini selesai, auto-generate task `Kontrol Kebuntingan` baru lagi dengan offset berikutnya (misal +21 hari dari pemeriksaan ini), supaya reminder berlanjut sampai status final diketahui.
  - Jika `hasil = gagal`: update `breeding.matings.status='gagal'`, tandai task selesai, tidak ada task baru (siklus mating ini berakhir).
  - Jika `hasil = keguguran`: update `breeding.pregnancies.pregnancy_status='keguguran'` (pregnancy harus sudah ada) dan `breeding.matings.status='gagal'`, tandai task selesai.
- `POST /api/breeding/births` — submit form "Pencatatan Kelahiran". Body: `id_pregnancy` (atau `id_mating` lalu di-resolve ke pregnancy terkait), `birth_date`, `number_of_offspring`, `offspring_gender`, `offspring_condition`, `notes`, `id_task`.
  - Insert `breeding.births`, update `breeding.pregnancies.pregnancy_status='melahirkan'`, update `breeding.matings.status='sukses'`, tandai task selesai.
  - Catatan: tabel `births` ini bersifat agregat per kelompok anak (litter-level), bukan per individu domba — pembuatan entri individu domba baru ke `livestock.sheep` (dengan `id_father`/`id_mother` terisi dari mating terkait) adalah langkah terpisah yang sudah ada di sistem; pastikan langkah itu tetap dipicu/terhubung setelah birth record dibuat (cek alur existing untuk pendaftaran anak domba baru).

### 3. Frontend (Vue.js)

- Form IB (existing "Isi Form Pencatatan" → PERKAWINAN → IB):
  - Label `ID Domba` → **`ID Domba Betina`**.
  - Field baru **Sumber Pejantan**: radio "Pejantan Internal" (dropdown dari panel Info Daftar Ternak yang sudah ada) vs "Donor Eksternal (Straw)" (input: nama/kode donor, asal, kode straw).
  - Field `Petugas Inseminator` (opsional).
  - Info box read-only: "Estimasi tanggal lahir: [mating_date + 148 hari]".
- Form baru **Kontrol Kebuntingan** (rincian baru di tab PERKAWINAN):
  - Dropdown **"Pilih Data Perkawinan"** — populasi dari `breeding.matings` dengan `status='proses'`, tampilkan kode/nama betina + tanggal kawin + "sudah X hari" (kalau task dibuka dari task list yang sudah punya `id_mating`, field ini auto-terisi/read-only).
  - Field `Tanggal Pemeriksaan`, `Metode Pemeriksaan` (dropdown: Non-Return Estrus / USG-Palpasi / Manual), `Hasil` (radio: Masih Menunggu / Bunting Terkonfirmasi / Gagal Tidak Bunting / Keguguran), `Catatan`.
- Reminder/worklist task Kontrol Kebuntingan dan Pencatatan Kelahiran **memanfaatkan task list/dashboard yang sudah ada** (`operations.tasks` + `operations.notifications`) — tidak perlu komponen worklist baru terpisah, cukup pastikan task hasil auto-generate di atas muncul wajar di listing/dashboard task existing (filter by `category='perkawinan'`/`'kelahiran'` dan `rincian` terkait sudah cukup).

### 4. Logika Bisnis yang Harus Dijaga

- Konstanta yang dipakai berulang (offset 21 hari untuk kontrol pertama, 148 hari untuk estimasi lahir) ditaruh di satu tempat konfigurasi, bukan hardcode tersebar.
- `breeding.pregnancies.pregnancy_status` adalah sumber kebenaran tahap kebuntingan; `breeding.matings.status` selalu di-derive otomatis dari situ melalui service/handler, jangan diizinkan diupdate manual secara independen sehingga bisa kontradiksi.
- Entri `livestock.sheep` dengan `status='eksternal'` tidak boleh muncul di listing kandang, penimbangan (`livestock.weights`), kesehatan (`livestock.healths`), atau pemberian pakan (`logistics.feedings`) — pastikan filter di endpoint-endpoint terkait tidak sengaja mengikutsertakannya.
- Kalkulasi `coefficient_of_inbreeding` harus tetap mengembalikan 0/false (bukan error) ketika salah satu pihak adalah founder tanpa `id_father`/`id_mother` (termasuk donor eksternal).

## Output yang Diharapkan

Implementasikan migrasi SQL di atas (sebagai file migrasi baru, ikuti konvensi penamaan file timestamp yang sudah dipakai di folder migrasi proyek ini), handler Go untuk semua endpoint yang disebutkan, dan komponen/perubahan Vue untuk form IB serta form baru Kontrol Kebuntingan. Sebelum implementasi, konfirmasi query/filter "Domba Kandang Aktif" memang berbasis `status='aktif'` sebelum mengandalkan strategi status `'eksternal'`. Gunakan `status='pending'` untuk task baru dan `status='selesai'` saat task diselesaikan, sesuai konvensi yang sudah berjalan di aplikasi. Sertakan unit test untuk: validasi sumber pejantan wajib terisi, kalkulasi `expected_birth_date`, auto-generate task follow-up setelah mating dibuat, dan sinkronisasi status mating↔pregnancy↔task.
