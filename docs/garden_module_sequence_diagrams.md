# Sequence Diagram Modular: Alur Fungsional Perkebunan (Farmease Gardening) — Versi Revisi

Dokumen ini memuat diagram urutan (*sequence diagram*) dalam format Mermaid Markdown untuk masing-masing Use Case pada modul Perkebunan Farmease, diselaraskan dengan skenario Use Case revisi (4 Use Case).

---

## UC-01: Melihat Dasbor

Aktor memantau ringkasan kondisi terkini perkebunan melalui dasbor secara *real-time*.

### Normal-1: Pemilik melihat dasbor perkebunan
```mermaid
sequenceDiagram
    autonumber
    actor Pemilik
    participant UI as ui:DashboardView
    participant LH as lh:Lahan
    participant PH as ph:Pohon
    participant DB as db:Database

    Pemilik->>UI: Buka Halaman Dasbor Perkebunan
    activate UI
    UI->>LH: GetLahanList(filter)
    activate LH
    LH->>DB: GetLahanList(filter)
    DB-->>LH: Rows data lahan & panen
    LH-->>UI: Data ringkasan luas lahan & panen
    deactivate LH

    UI->>PH: GetPohonList(lahanID)
    activate PH
    PH->>DB: GetPohonList(lahanID)
    DB-->>PH: Rows data pohon
    PH-->>UI: Data pohon per fase
    deactivate PH

    UI-->>Pemilik: Menampilkan dasbor Pemilik (read-only)
    deactivate UI
```

### Normal-2: Admin melihat dasbor perkebunan
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as ui:DashboardView
    participant LH as lh:Lahan
    participant PH as ph:Pohon
    participant DB as db:Database

    Admin->>UI: Buka Halaman Dasbor Perkebunan
    activate UI
    UI->>LH: GetLahanList(filter)
    activate LH
    LH->>DB: GetLahanList(filter)
    DB-->>LH: Rows data lahan & panen
    LH-->>UI: Data ringkasan luas lahan & panen
    deactivate LH

    UI->>PH: GetPohonList(lahanID)
    activate PH
    PH->>DB: GetPohonList(lahanID)
    DB-->>PH: Rows data pohon
    PH-->>UI: Data pohon per fase
    deactivate PH

    UI-->>Admin: Menampilkan dasbor Admin dengan Panel Admin
    deactivate UI
```

### Normal-3: Operator Kebun melihat dasbor perkebunan
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:DashboardView
    participant LH as lh:Lahan
    participant PH as ph:Pohon
    participant DB as db:Database

    Operator->>UI: Buka Halaman Dasbor Perkebunan
    activate UI
    UI->>LH: GetLahanList(filter)
    activate LH
    LH->>DB: GetLahanList(filter)
    DB-->>LH: Rows data lahan
    LH-->>UI: Data ringkasan luas lahan
    deactivate LH

    UI->>PH: GetPohonList(lahanID)
    activate PH
    PH->>DB: GetPohonList(lahanID)
    DB-->>PH: Rows data pohon
    PH-->>UI: Data pohon per fase
    deactivate PH

    UI-->>Operator: Menampilkan dasbor Operator untuk lahan aktif
    deactivate UI
```

### Tidak Normal-1: Dasbor gagal dimuat
```mermaid
sequenceDiagram
    autonumber
    actor Aktor as Pengguna
    participant UI as ui:DashboardView
    participant LH as lh:Lahan
    participant DB as db:Database

    Aktor->>UI: Buka Halaman Dasbor Perkebunan
    activate UI
    UI->>LH: GetLahanList(filter)
    activate LH
    LH->>DB: GetLahanList(filter)
    DB-->>LH: Connection timeout / Error
    deactivate LH
    UI-->>Aktor: Tampilkan pesan "Dasbor tidak dapat dimuat, silakan coba kembali"
    deactivate UI
```

---

## UC-02: Kelola Data Pengolahan Pupuk

Operator Kebun mengelola pencatatan fermentasi pupuk dan pengecekan berkala (cek fermentasi).

### Normal-1: Operator Kebun mencatat proses fermentasi pupuk
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormFermentasiView
    participant SB as sb:StokBahan
    participant FER as fer:FermentasiPupuk
    participant DB as db:Database

    Operator->>UI: Buka form pencatatan fermentasi pupuk
    activate UI
    UI->>SB: GetStokBahanList()
    activate SB
    SB->>DB: GetStokBahanList()
    DB-->>SB: Rows data stok bahan
    SB-->>UI: Daftar persediaan bahan baku mentah
    deactivate SB
    UI-->>Operator: Tampilkan form & sisa stok bahan
    deactivate UI

    Operator->>UI: Input detail bahan, air, dekomposer & klik "Simpan"
    activate UI
    UI->>FER: CreateFermentasi(f)
    activate FER
    FER->>DB: CreateFermentasi(f)
    DB-->>FER: Success (status: proses)
    FER-->>UI: Batch fermentasi pupuk diinisiasi
    deactivate FER

    UI->>SB: UpdateStokBahan(id, qty)
    activate SB
    SB->>DB: UpdateStokBahan(id, qty)
    DB-->>SB: Success
    SB-->>UI: Stok bahan mentah terpotong
    deactivate SB
    UI-->>Operator: Pesan "Pencatatan Fermentasi Berhasil Simpan"
    deactivate UI
```

### Normal-2: Operator melakukan cek fermentasi dan pupuk siap digunakan
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormCekFermentasiView
    participant FER as fer:FermentasiPupuk
    participant LOG as log:LogFermentasiPupuk
    participant SP as sp:StokPupuk
    participant DB as db:Database

    Operator->>UI: Buka form Cek Fermentasi
    activate UI
    UI->>FER: GetFermentasiList()
    activate FER
    FER->>DB: GetFermentasiList()
    DB-->>FER: Rows batch aktif
    FER-->>UI: Daftar batch fermentasi aktif
    deactivate FER
    UI-->>Operator: Tampilkan panduan teknis & riwayat pengecekan
    deactivate UI

    Operator->>UI: Input perlakuan & pilih status "Siap Digunakan"
    activate UI
    UI->>LOG: CreateLogFermentasi(l)
    activate LOG
    LOG->>DB: CreateLogFermentasi(l)
    DB-->>LOG: Success (status: selesai)
    LOG-->>UI: Log pengecekan berhasil tersimpan
    deactivate LOG

    UI->>SP: UpdateStokPupuk(id, qty)
    activate SP
    SP->>DB: UpdateStokPupuk(id, qty)
    DB-->>SP: Success
    SP-->>UI: Persediaan stok pupuk bertambah
    deactivate SP
    UI-->>Operator: Pesan "Cek Fermentasi Tersimpan & Pupuk Masuk Gudang"
    deactivate UI
```

### Normal-3: Operator mencatat kegagalan proses fermentasi
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormCekFermentasiView
    participant LOG as log:LogFermentasiPupuk
    participant DB as db:Database

    Operator->>UI: Input perlakuan & pilih status "Gagal"
    activate UI
    UI->>LOG: CreateLogFermentasi(l)
    activate LOG
    LOG->>DB: CreateLogFermentasi(l)
    DB-->>LOG: Success (update batch status ke "gagal")
    LOG-->>UI: Log kegagalan fermentasi disimpan
    deactivate LOG
    UI-->>Operator: Pesan "Proses Fermentasi Gagal & Log Dinonaktifkan"
    deactivate UI
```

### Tidak Normal-1: Pencatatan pengolahan pupuk gagal (Validasi)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormFermentasiView
    participant FER as fer:FermentasiPupuk

    Operator->>UI: Input data tidak lengkap & klik "Simpan"
    activate UI
    UI->>FER: CreateFermentasi(f)
    activate FER
    FER-->>UI: Error: data tidak valid / tidak lengkap
    deactivate FER
    UI-->>Operator: Tampilkan pesan error validasi
    deactivate UI
```

### Tidak Normal-2: Inisiasi Fermentasi Melebihi Persediaan Stok
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormFermentasiView
    participant SB as sb:StokBahan
    participant DB as db:Database

    Operator->>UI: Input Jumlah Pembuatan melebihi sisa stok
    activate UI
    UI->>SB: GetStokBahanList()
    activate SB
    SB->>DB: GetStokBahanList()
    DB-->>SB: Rows data stok bahan
    SB-->>UI: Daftar sisa persediaan bahan baku
    deactivate SB
    UI-->>Operator: Tampilkan "Peringatan Stok Kurang"
    deactivate UI
```

---

## UC-03: Kelola Data Pemupukan

Operator mencatat pemupukan harian pada pohon tertentu dibantu rekomendasi pupuk otomatis.

### Normal-1: Membuka formulir pencatatan pemupukan
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPemupukanView
    participant PH as ph:Pohon
    participant DB as db:Database

    Operator->>UI: Pilih Jenis Pencatatan "Pemupukan" & rincian kategori
    activate UI
    UI->>PH: GetPohonList(lahanID)
    activate PH
    PH->>DB: GetPohonList(lahanID)
    DB-->>PH: Rows data pohon di lahan terkait
    PH-->>UI: Daftar pohon aktif terfilter
    deactivate PH
    UI-->>Operator: Formulir pencatatan pemupukan termuat
    deactivate UI
```

### Normal-2: Operator mencatat pemupukan (fermentasi)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPemupukanView
    participant PMP as pmp:Pemupukan
    participant SP as sp:StokPupuk
    participant SB as sb:Submission
    participant DB as db:Database

    Operator->>UI: Input varietas, pohon, jenis pupuk, & teknik
    UI-->>Operator: Tampilkan rekomendasi dosis & racikan fermentasi

    Operator->>UI: Input jumlah pupuk dipakai & klik "Simpan"
    activate UI
    UI->>PMP: RecordPemupukan(pmp)
    activate PMP
    PMP->>DB: RecordPemupukan(pmp)
    DB-->>PMP: Success
    PMP-->>UI: Detail log pemupukan tersimpan
    deactivate PMP

    UI->>SP: UpdateStokPupuk(id, qty)
    activate SP
    SP->>DB: UpdateStokPupuk(id, qty)
    DB-->>SP: Success
    SP-->>UI: Stok pupuk di gudang terpotong
    deactivate SP

    UI->>SB: CreateSubmission(sub)
    activate SB
    SB->>DB: CreateSubmission(sub)
    DB-->>SB: Success (status: pending)
    SB-->>UI: Pengajuan pending terbuat
    deactivate SB
    UI-->>Operator: Pencatatan Diajukan -- Menunggu Persetujuan
    deactivate UI
```

### Tidak Normal-1: Pencatatan pemupukan gagal (Validasi)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPemupukanView
    participant PMP as pmp:Pemupukan

    Operator->>UI: Input parameter tidak valid & klik "Simpan"
    activate UI
    UI->>PMP: RecordPemupukan(pmp)
    activate PMP
    PMP-->>UI: Error: data pemupukan tidak valid
    deactivate PMP
    UI-->>Operator: Tampilkan pesan error validasi
    deactivate UI
```

### Tidak Normal-2: Pencatatan pemupukan melebihi stok gudang
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPemupukanView
    participant SP as sp:StokPupuk
    participant DB as db:Database

    Operator->>UI: Input jumlah pemakaian pupuk melebihi sisa stok
    activate UI
    UI->>SP: UpdateStokPupuk(id, qty)
    activate SP
    SP->>DB: UpdateStokPupuk(id, qty)
    DB-->>SP: Rows persediaan pupuk
    SP-->>UI: Validasi kecukupan kuantitas stok (gagal)
    deactivate SP
    UI-->>Operator: Tampilkan "Peringatan Stok Kurang"
    deactivate UI
```

---

## UC-04: Kelola Data Pemberian Obat

Operator mencatat aktivitas pemberian obat dibantu rekomendasi obat dan jenis OPT.

### Normal-1: Membuka formulir pemberian obat
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPengobatanView
    participant PH as ph:Pohon
    participant DB as db:Database

    Operator->>UI: Pilih Jenis Pencatatan "Pemberian Obat" & rincian kategori
    activate UI
    UI->>PH: GetPohonList(lahanID)
    activate PH
    PH->>DB: GetPohonList(lahanID)
    DB-->>PH: Rows data pohon di lahan terkait
    PH-->>UI: Daftar pohon aktif terfilter
    deactivate PH
    UI-->>Operator: Formulir pencatatan pemberian obat termuat
    deactivate UI
```

### Normal-2: Operator mencatat pemberian obat
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPengobatanView
    participant PGO as pgo:Pengobatan
    participant SO as so:StokObat
    participant SB as sb:Submission
    participant DB as db:Database

    Operator->>UI: Input varietas, pohon, OPT, nama obat, & teknik
    UI-->>Operator: Tampilkan info kadaluwarsa & rekomendasi dosis obat

    Operator->>UI: Input volume obat & larutan, klik "Simpan"
    activate UI
    UI->>PGO: RecordPengobatan(pgo)
    activate PGO
    PGO->>DB: RecordPengobatan(pgo)
    DB-->>PGO: Success
    PGO-->>UI: Detail log pemberian obat tersimpan
    deactivate PGO

    UI->>SO: UpdateStokObat(id, qty)
    activate SO
    SO->>DB: UpdateStokObat(id, qty)
    DB-->>SO: Success
    SO-->>UI: Stok obat di gudang terpotong
    deactivate SO

    UI->>SB: CreateSubmission(sub)
    activate SB
    SB->>DB: CreateSubmission(sub)
    DB-->>SB: Success (status: pending)
    SB-->>UI: Pengajuan pending terbuat
    deactivate SB
    UI-->>Operator: Pencatatan Diajukan -- Menunggu Persetujuan
    deactivate UI
```

### Tidak Normal-1: Pencatatan pemberian obat gagal (Validasi)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPengobatanView
    participant PGO as pgo:Pengobatan

    Operator->>UI: Input parameter tidak valid & klik "Simpan"
    activate UI
    UI->>PGO: RecordPengobatan(pgo)
    activate PGO
    PGO-->>UI: Error: data pengobatan tidak valid
    deactivate PGO
    UI-->>Operator: Tampilkan pesan error validasi
    deactivate UI
```

### Tidak Normal-2: Pencatatan pemberian obat melebihi stok gudang
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Kebun
    participant UI as ui:FormPengobatanView
    participant SO as so:StokObat
    participant DB as db:Database

    Operator->>UI: Input volume obat melebihi sisa stok
    activate UI
    UI->>SO: UpdateStokObat(id, qty)
    activate SO
    SO->>DB: UpdateStokObat(id, qty)
    DB-->>SO: Rows persediaan obat
    SO-->>UI: Validasi kecukupan kuantitas stok (gagal)
    deactivate SO
    UI-->>Operator: Tampilkan "Peringatan Stok Kurang"
    deactivate UI
```
