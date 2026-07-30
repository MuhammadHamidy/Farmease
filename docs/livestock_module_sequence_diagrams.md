# Sequence Diagram Modular: Alur Fungsional Sistem Peternakan (Farmease)

Dokumen ini memuat diagram urutan (*sequence diagram*) untuk masing-masing Use Case pada Sistem Pencatatan Ternak Farmease. Seluruh pemanggilan method pada lifeline entitas konsisten dengan method yang terdapat di dalam **Class Diagram**.

---

## UC-01: Melihat Dasbor Ternak
Menampilkan ringkasan populasi, statistik kesehatan kandang, tingkat okupansi kandang, dan log aktivitas terbaru.

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna as Pemilik / Admin / Operator
    participant UI as ui:DashboardView
    participant CS as cs:Cage
    participant DB as db:Database

    Pengguna->>UI: Buka Halaman Utama / Dasbor
    UI->>CS: GetCageStats()
    activate CS
    CS->>DB: GetCageStats()
    DB-->>CS: Data statistik kandang
    CS-->>UI: Return data statistik
    deactivate CS
    UI-->>Pengguna: Menampilkan grafik & ringkasan dasbor peternakan
```

---

## UC-02: Kelola Data Identitas Domba

### 2.1. Registrasi Domba Baru
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant CS as cs:Cage
    participant SS as ss:Sheep
    participant DB as db:Database

    Operator->>UI: Buka halaman Registrasi Domba
    UI->>CS: GetCageList(filter)
    activate CS
    CS->>DB: GetCageList(filter)
    DB-->>CS: Data kandang
    CS-->>UI: Daftar pilihan kandang
    deactivate CS
    UI-->>Operator: Tampilkan form registrasi domba & pilihan kandang

    Operator->>UI: Isi data domba (kode, nama, kelamin, kandang) & klik "Simpan"
    UI->>SS: RegisterSheep(s)
    activate SS
    SS->>DB: RegisterSheep(s)
    DB-->>SS: Success
    SS-->>UI: Registrasi berhasil disimpan
    deactivate SS
    UI-->>Operator: Tampilkan pesan "Domba Baru Berhasil Terdaftar"
```

### 2.2. Mutasi Kandang Domba
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant CS as cs:Cage
    participant SS as ss:Sheep
    participant DB as db:Database

    Operator->>UI: Pilih Domba & klik "Mutasi Kandang"
    UI->>CS: GetCageList(filter)
    activate CS
    CS->>DB: GetCageList(filter)
    DB-->>CS: Daftar kandang tersedia
    CS-->>UI: Daftar pilihan kandang
    deactivate CS
    UI-->>Operator: Tampilkan pilihan kandang tujuan

    Operator->>UI: Pilih kandang tujuan & klik "Simpan"
    UI->>SS: UpdateSheep(id, s)
    activate SS
    SS->>DB: UpdateSheep(id, s)
    DB-->>SS: Success
    SS-->>UI: Mutasi berhasil disimpan
    deactivate SS
    UI-->>Operator: Tampilkan pesan "Domba Berhasil Dimutasi"
```

---

## UC-03: Kelola Data Peternakan

### 3.1. Pencatatan Perkawinan & Kelahiran Anak Domba
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant MS as ms:Mating
    participant PS as ps:Pregnancy
    participant DB as db:Database

    %% Pencatatan Perkawinan
    Note over Operator, DB: Proses Pencatatan Perkawinan
    Operator->>UI: Input ID Pejantan & ID Betina
    UI->>MS: RecordMating(m)
    activate MS
    MS->>DB: RecordMating(m)
    DB-->>MS: Success
    MS-->>UI: Data perkawinan tercatat
    deactivate MS
    UI-->>Operator: Tampilkan pesan "Perkawinan Berhasil Dicatat"

    %% Cek Kehamilan
    Note over Operator, DB: Pemeriksaan Kehamilan (Beberapa minggu kemudian)
    Operator->>UI: Input hasil cek kehamilan (Positif Hamil)
    UI->>PS: RecordPregnancy(p)
    activate PS
    PS->>DB: RecordPregnancy(p)
    DB-->>PS: Success
    PS-->>UI: Data kehamilan disimpan
    deactivate PS
    UI-->>Operator: Tampilkan pesan "Status Domba Berubah Menjadi Hamil"

    %% Hari Kelahiran
    Note over Operator, DB: Pencatatan Kelahiran Anak Domba
    Operator->>UI: Input data kelahiran anak domba
    UI->>PS: RecordBirth(id, count)
    activate PS
    PS->>DB: RecordBirth(id, count)
    DB-->>PS: Success
    PS-->>UI: Kelahiran anak domba tercatat
    deactivate PS
    UI-->>Operator: Tampilkan pesan "Data Kelahiran Anak Domba Berhasil Disimpan"
```

### 3.2. Pencatatan Pemberian Pakan Harian
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant FS as fs:Feed
    participant DB as db:Database

    Operator->>UI: Buka halaman Pemberian Pakan
    UI->>FS: GetMasterFeedList()
    activate FS
    FS->>DB: GetMasterFeedList()
    DB-->>FS: Data jenis pakan & kuantitas
    FS-->>UI: Daftar pilihan pakan
    deactivate FS
    UI-->>Operator: Tampilkan form pemberian pakan

    Operator->>UI: Pilih jenis pakan, input jumlah (kg), pilih kandang, & klik "Simpan"
    UI->>FS: RecordFeeding(f)
    activate FS
    FS->>DB: RecordFeeding(f)
    FS->>DB: UpdateFeedStock(amount, "kurang")
    DB-->>FS: Success
    FS-->>UI: Pemberian pakan tercatat & stok dikurangi
    deactivate FS
    UI-->>Operator: Tampilkan pesan "Pencatatan Pemberian Pakan Sukses"
```

### 3.3. Pencatatan Bobot Domba & ADG
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant WS as ws:WeightRecord
    participant DB as db:Database

    Operator->>UI: Input ID Domba & Bobot Baru (misal: 45kg)
    UI->>WS: RecordWeight(w)
    activate WS
    WS->>DB: RecordWeight(w)
    DB-->>WS: Success
    WS-->>UI: Hasil timbangan disimpan
    deactivate WS
    UI-->>Operator: Menampilkan bobot baru & laju pertumbuhan harian (ADG)
```

---

## UC-04: Kelola Stok Pakan

### 4.1. Pembuatan Batch Fermentasi Silase
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant FS as fs:Feed
    participant DB as db:Database

    Operator->>UI: Input bahan baku & target kuantitas silase
    UI->>FS: RecordSilageConversion(sc)
    activate FS
    FS->>DB: RecordSilageConversion(sc)
    DB-->>FS: Success
    FS-->>UI: Batch silase berhasil dibuat
    deactivate FS
    UI-->>Operator: Tampilkan status batch "Dalam Proses Fermentasi"
```

### 4.2. Pencatatan Log Aktivitas Fermentasi
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant FER as fer:SilageFermentationLog
    participant DB as db:Database

    Operator->>UI: Input kondisi perkembangan silase (suhu, catatan)
    UI->>FER: CreateFermentationLog(l)
    activate FER
    FER->>DB: CreateFermentationLog(l)
    DB-->>FER: Success
    FER-->>UI: Log berhasil disimpan
    deactivate FER
    UI-->>Operator: Tampilkan pesan "Log Harian Fermentasi Tersimpan"
```

---

## UC-05: Menvalidasi Pencatatan Operator
*(Catatan: Detail diagram sekuensial lengkap untuk proses peninjauan, persetujuan admin, dan integrasi pesan RabbitMQ dipisahkan di berkas `livestock_architecture_sequence_diagram.md`).*

---

## UC-06: Melihat Silsilah Domba

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant SS as ss:Sheep
    participant DB as db:Database

    Operator->>UI: Buka profil detail domba & klik "Lihat Silsilah"
    UI->>SS: GetSheepGenealogy()
    activate SS
    SS->>DB: GetSheepGenealogy()
    DB-->>SS: Data relasi silsilah
    SS-->>UI: Struktur silsilah
    deactivate SS
    UI-->>Operator: Menampilkan diagram silsilah (family tree) domba
```

---

## UC-07: Kelola Data Birahi

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant MS as ms:Mating
    participant DB as db:Database

    Operator->>UI: Input hasil pemeriksaan birahi betina (Hasil: "birahi")
    UI->>MS: RecordEstrusCheck(ec)
    activate MS
    MS->>DB: RecordEstrusCheck(ec)
    DB-->>MS: Success
    MS-->>UI: Riwayat cek birahi disimpan
    deactivate MS
    UI-->>Operator: Tampilkan pesan "Pengecekan Birahi Berhasil Dicatat"
```

---

## UC-08: Melihat Riwayat Kesehatan

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant HS as hs:HealthRecord
    participant DB as db:Database

    %% 8.1. Pencatatan Kesehatan
    Note over Operator, DB: 1. Proses Pencatatan Medis
    Operator->>UI: Input log kesehatan (ID Domba, diagnosis, obat, dosis)
    UI->>HS: RecordHealth(hr)
    activate HS
    HS->>DB: RecordHealth(hr)
    DB-->>HS: Success
    HS-->>UI: Log kesehatan disimpan
    deactivate HS
    UI-->>Operator: Tampilkan pesan "Log Kesehatan Tersimpan"

    %% 8.2. Melihat Riwayat Pengobatan
    Note over Operator, DB: 2. Melihat Rekap Riwayat Kesehatan
    Operator->>UI: Klik tab "Riwayat Pengobatan Domba"
    UI->>HS: GetHealthHistory(id)
    activate HS
    HS->>DB: GetHealthHistory(id)
    DB-->>HS: Daftar riwayat diagnosa & pengobatan
    HS-->>UI: Rekap riwayat kesehatan
    deactivate HS
    UI-->>Operator: Tampilkan daftar riwayat medis domba
```
