# Sequence Diagram Modular: Alur Fungsional Sistem Peternakan (Farmease)

Dokumen ini memuat diagram urutan (*sequence diagram*) untuk masing-masing Use Case pada Sistem Pencatatan Ternak Farmease. Diagram ini menggunakan pendekatan konseptual tingkat tinggi (High-Level Conceptual) untuk mempermudah pemahaman alur sistem bagi pembimbing dan penguji.

---

## UC-01: Melihat Dasbor Ternak
Menampilkan ringkasan populasi, statistik kesehatan kandang, tingkat okupansi kandang, dan log aktivitas terbaru.

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna as Pemilik / Admin / Operator
    participant UI as ui:Antarmuka
    participant DS as ds:DasborService
    participant DB as db:Database

    Pengguna->>UI: Buka Halaman Utama / Dasbor
    UI->>DS: getDasborStats()
    activate DS
    DS->>DB: selectStatistikPopulasi()
    DB-->>DS: Data jumlah domba & okupansi kandang
    DS->>DB: selectLogAktivitasTerakhir()
    DB-->>DS: Data log aktivitas terbaru
    DS-->>UI: Return data statistik & log
    deactivate DS
    UI-->>Pengguna: Menampilkan grafik & ringkasan dasbor peternakan
```

---

## UC-02: Kelola Data Identitas Domba
Menangani proses registrasi identitas domba baru serta mutasi pemindahan domba antar-kandang.

### 2.1. Registrasi Domba Baru
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant DS as ds:DombaService
    participant KS as ks:KandangService
    participant DB as db:Database

    Operator->>UI: Buka halaman Registrasi Domba
    UI->>KS: getKandangTersedia()
    activate KS
    KS->>DB: selectKandangTersedia()
    DB-->>KS: Data kandang
    KS-->>UI: Daftar pilihan kandang
    deactivate KS
    UI-->>Operator: Tampilkan form registrasi domba & pilihan kandang

    Operator->>UI: Isi data domba (kode, nama, kelamin, kandang) & klik "Simpan"
    UI->>DS: registrasiDomba(data_domba)
    activate DS
    DS->>DB: checkKodeDombaExist(kode_domba)
    DB-->>DS: Belum terdaftar (aman)
    
    DS->>DB: insertDombaBaru(data_domba)
    DS->>DB: tambahOccupancyKandang(id_kandang)
    
    DS-->>UI: Registrasi berhasil disimpan
    deactivate DS
    UI-->>Operator: Tampilkan pesan "Domba Baru Berhasil Terdaftar"
```

### 2.2. Mutasi Kandang Domba
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant KS as ks:KandangService
    participant DS as ds:DombaService
    participant DB as db:Database

    Operator->>UI: Pilih Domba & klik "Mutasi Kandang"
    UI->>KS: getKandangTersedia()
    activate KS
    KS->>DB: selectKandangTersedia()
    DB-->>KS: Data kandang tersedia
    KS-->>UI: Daftar pilihan kandang
    deactivate KS
    UI-->>Operator: Tampilkan pilihan kandang tujuan

    Operator->>UI: Pilih kandang tujuan & klik "Simpan"
    UI->>DS: mutasiKandang(id_domba, id_kandang_baru)
    activate DS
    DS->>DB: updateKandangDomba(id_domba, id_kandang_baru)
    DS->>DB: updateKapasitasKandang(id_kandang_lama, id_kandang_baru)
    DS-->>UI: Mutasi berhasil disimpan
    deactivate DS
    UI-->>Operator: Tampilkan pesan "Domba Berhasil Dimutasi"
```

---

## UC-03: Kelola Data Peternakan
Merupakan alur pencatatan fungsionalitas harian domba (pakan harian, kawin/reproduksi, berat/ADG).

### 3.1. Pencatatan Perkawinan & Kelahiran Anak Domba
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant RS as rs:ReproduksiService
    participant DB as db:Database

    %% Pencatatan Perkawinan
    Note over Operator, DB: Proses Pencatatan Perkawinan
    Operator->>UI: Input ID Pejantan & ID Betina
    UI->>RS: simpanPerkawinan(id_jantan, id_betina)
    activate RS
    RS->>DB: checkStatusBirahiBetina(id_betina)
    DB-->>RS: Status terakhir: "birahi" (aman untuk kawin)
    RS->>DB: insertPerkawinan()
    RS-->>UI: Data perkawinan tercatat
    deactivate RS
    UI-->>Operator: Tampilkan pesan "Perkawinan Berhasil Dicatat"

    %% Cek Kehamilan
    Note over Operator, DB: Pemeriksaan Kehamilan (Beberapa minggu kemudian)
    Operator->>UI: Input hasil cek kehamilan (Positif Hamil)
    UI->>RS: simpanKehamilan(id_betina, est_tgl_lahir)
    activate RS
    RS->>DB: insertKehamilan()
    RS->>DB: updateStatusDomba(id_betina, status="hamil")
    RS-->>UI: Data kehamilan disimpan
    deactivate RS
    UI-->>Operator: Tampilkan pesan "Status Domba Berubah Menjadi Hamil"

    %% Hari Kelahiran
    Note over Operator, DB: Pencatatan Kelahiran Anak Domba
    Operator->>UI: Input data kelahiran anak domba (jumlah anak, jenis kelamin)
    UI->>RS: catatKelahiran(id_kehamilan, jumlah_anak)
    activate RS
    RS->>DB: updateStatusKehamilan(id_kehamilan, status="selesai")
    loop Sebanyak jumlah anak yang lahir
        RS->>DB: insertAnakDombaBaru()
    end
    RS-->>UI: Kelahiran anak domba tercatat
    deactivate RS
    UI-->>Operator: Tampilkan pesan "Data Kelahiran Anak Domba Berhasil Disimpan"
```

### 3.2. Pencatatan Pemberian Pakan Harian
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant PS as ps:PakanService
    participant DB as db:Database

    Operator->>UI: Buka halaman Pemberian Pakan
    UI->>PS: getDaftarStokPakan()
    activate PS
    PS->>DB: selectStokPakan()
    DB-->>PS: Data jenis pakan & kuantitas
    PS-->>UI: Daftar pilihan pakan
    deactivate PS
    UI-->>Operator: Tampilkan form pemberian pakan

    Operator->>UI: Pilih jenis pakan, input jumlah (kg), pilih kandang, & klik "Simpan"
    UI->>PS: catatPemberianPakan(id_kandang, id_pakan, jumlah_kg)
    activate PS
    PS->>DB: insertRiwayatPemberianPakan(id_kandang, id_pakan, jumlah_kg)
    PS->>DB: kurangiStokPakan(id_pakan, jumlah_kg)
    PS-->>UI: Pemberian pakan tercatat & stok dikurangi
    deactivate PS
    UI-->>Operator: Tampilkan pesan "Pencatatan Pemberian Pakan Sukses"
```

### 3.3. Pencatatan Bobot Domba & ADG
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant BS as bs:BobotService
    participant DB as db:Database

    Operator->>UI: Input ID Domba & Bobot Baru (misal: 45kg)
    UI->>BS: catatTimbangan(id_domba, bobot_baru)
    activate BS
    BS->>DB: selectTimbanganTerakhir(id_domba)
    DB-->>BS: Data timbangan sebelumnya (tgl, bobot)
    
    BS->>BS: hitungADG(bobot_baru, bobot_lama, selisih_hari)
    
    BS->>DB: insertRiwayatTimbangan(id_domba, bobot_baru, nilai_adg)
    BS->>DB: updateBobotTerakhirDomba(id_domba, bobot_baru)
    BS-->>UI: Hasil timbangan & nilai ADG (misal: +100g/hari)
    deactivate BS
    UI-->>Operator: Menampilkan bobot baru & laju pertumbuhan harian (ADG)
```

---

## UC-04: Kelola Stok Pakan
Menangani aktivitas produksi batch pakan fermentasi (silase) serta mencatat log perkembangan fermentasi.

### 4.1. Pembuatan Batch Fermentasi Silase
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant PS as ps:PakanService
    participant DB as db:Database

    Operator->>UI: Input bahan baku & target kuantitas silase
    UI->>PS: buatBatchFermentasi(bahan_baku, target_qty)
    activate PS
    PS->>DB: insertBatchFermentasi(status="proses")
    loop Setiap bahan baku yang dipakai
        PS->>DB: kurangiStokBahanBaku(bahan_id, qty)
    end
    PS-->>UI: Batch silase berhasil dibuat
    deactivate PS
    UI-->>Operator: Tampilkan status batch "Dalam Proses Fermentasi"
```

### 4.2. Pencatatan Log Aktivitas Fermentasi
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant PS as ps:PakanService
    participant DB as db:Database

    Operator->>UI: Input kondisi perkembangan silase (suhu, catatan)
    UI->>PS: tambahLogFermentasi(id_batch, suhu, notes)
    activate PS
    PS->>DB: insertLogFermentasi()
    PS-->>UI: Log berhasil disimpan
    deactivate PS
    UI-->>Operator: Tampilkan pesan "Log Harian Fermentasi Tersimpan"
```

---

## UC-05: Menvalidasi Pencatatan Operator
*(Catatan: Detail diagram sekuensial lengkap untuk proses peninjauan, persetujuan admin, dan integrasi pesan RabbitMQ dipisahkan di berkas `livestock_architecture_sequence_diagram.md` untuk kejelasan arsitektur sistem).*

---

## UC-06: Melihat Silsilah Domba
Menampilkan silsilah kekerabatan (*family tree*) domba untuk memantau garis keturunan dan menghindari kawin sedarah.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant DS as ds:DombaService
    participant DB as db:Database

    Operator->>UI: Buka profil detail domba & klik "Lihat Silsilah"
    UI->>DS: getSilsilahDomba(id_domba)
    activate DS
    DS->>DB: selectSilsilahDomba(id_domba)
    DB-->>DS: Data relasi induk betina & induk jantan (silsilah)
    DS-->>UI: Struktur silsilah domba
    deactivate DS
    UI-->>Operator: Menampilkan diagram silsilah (family tree) domba
```

---

## UC-07: Kelola Data Birahi
Mencatat riwayat pengecekan birahi betina sebelum melangkah ke proses kawin.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant RS as rs:ReproduksiService
    participant DB as db:Database

    Operator->>UI: Input hasil pemeriksaan birahi betina (Hasil: "birahi")
    UI->>RS: catatCekBirahi(id_betina, hasil_pemeriksaan)
    activate RS
    RS->>DB: insertCekBirahi(id_betina, hasil_pemeriksaan)
    RS-->>UI: Riwayat cek birahi disimpan
    deactivate RS
    UI-->>Operator: Tampilkan pesan "Pengecekan Birahi Berhasil Dicatat"
```

---

## UC-08: Melihat Riwayat Kesehatan
Mencatat keluhan sakit serta melihat rekap riwayat medis/pengobatan pada domba.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant KS as ks:KesehatanService
    participant DB as db:Database

    %% 8.1. Pencatatan Kesehatan
    Note over Operator, DB: 1. Proses Pencatatan Medis & Pemotongan Obat
    Operator->>UI: Input log kesehatan (ID Domba, diagnosis, obat, dosis)
    UI->>KS: catatKesehatan(id_domba, diagnosis, nama_obat, dosis)
    activate KS
    KS->>DB: insertRiwayatKesehatan()
    KS->>DB: kurangiStokObat(nama_obat, dosis)
    KS->>DB: updateStatusKesehatanDomba(id_domba, status="sakit")
    KS-->>UI: Log kesehatan disimpan
    deactivate KS
    UI-->>Operator: Tampilkan pesan "Log Kesehatan Tersimpan"

    %% 8.2. Melihat Riwayat Pengobatan
    Note over Operator, DB: 2. Melihat Rekap Riwayat Kesehatan
    Operator->>UI: Klik tab "Riwayat Pengobatan Domba"
    UI->>KS: getRiwayatKesehatanDomba(id_domba)
    activate KS
    KS->>DB: selectRiwayatKesehatanDomba(id_domba)
    DB-->>KS: Daftar riwayat diagnosa & pengobatan
    KS-->>UI: Rekap riwayat kesehatan
    deactivate KS
    UI-->>Operator: Tampilkan daftar riwayat medis domba
```
