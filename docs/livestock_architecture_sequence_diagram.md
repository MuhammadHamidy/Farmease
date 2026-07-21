# Desain Arsitektur: Sequence Diagram Sistem Peternakan (Farmease)

Dokumen ini memuat diagram urutan (*sequence diagram*) arsitektur untuk menggambarkan bagaimana data mengalir di dalam sistem Peternakan Farmease, memetakan alur konseptual tingkat tinggi antara aktor, antarmuka frontend, backend service, dan database.

---

## 1. Diagram Alur Pengajuan & Persetujuan Pencatatan (Submission & Approval Workflow)

Diagram ini mengilustrasikan alur ketika seorang Operator mengajukan pencatatan baru (seperti penimbangan bobot atau kesehatan) hingga disetujui oleh Admin dan memperbarui kondisi data domba.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Operator Ternak
    participant UI as ui:Antarmuka
    participant SS as ss:SubmissionService
    participant DB as db:Database
    actor Admin as Admin Farm

    %% Fase Pengajuan oleh Operator
    Note over Operator, DB: Fase 1: Pengajuan Pencatatan (Submission Request)
    Operator->>UI: Isi & kirim form pencatatan (misal: Bobot Domba)
    UI->>SS: ajukanPencatatan(data, jenis_pencatatan)
    activate SS
    SS->>DB: insertSubmission(status="pending")
    SS->>DB: kirimNotifikasiKeAdmin()
    SS-->>UI: Pengajuan berhasil disimpan
    deactivate SS
    UI-->>Operator: Menampilkan status "Menunggu Persetujuan"

    %% Fase Peninjauan oleh Admin
    Note over UI, Admin: Fase 2: Peninjauan & Persetujuan Admin (Review & Approve)
    Admin->>UI: Buka halaman Persetujuan (Pencatatan Baru)
    UI->>SS: getSubmissionsPending()
    activate SS
    SS->>DB: selectSubmissionsByStatus("pending")
    DB-->>SS: Daftar pengajuan pending
    SS-->>UI: Return daftar pengajuan
    deactivate SS
    UI-->>Admin: Menampilkan daftar pengajuan tertunda

    Admin->>UI: Klik "Setujui" (Approve)
    UI->>SS: setujuiPencatatan(id_submission)
    activate SS
    SS->>DB: updateStatusSubmission(id_submission, status="approved")
    
    rect rgb(230, 245, 230)
        Note over SS, DB: Fase 3: Pembaruan Data Domain Utama
        SS->>DB: insertDataKeTabelTimbangan()
        SS->>DB: updateBobotTerakhirDomba()
    end

    SS->>DB: kirimNotifikasiKeOperator()
    SS-->>UI: Validasi persetujuan selesai
    deactivate SS
    UI-->>Admin: Menampilkan notifikasi sukses persetujuan
```

---

## 2. Diagram Alur Distribusi Sisa Panen (Gardening Crop Residue Integration)

Diagram ini menggambarkan integrasi asinkron (*event-driven*) menggunakan broker pesan untuk menyalurkan sisa hasil pemangkasan/kebun perkebunan sebagai stok pakan ternak.

```mermaid
sequenceDiagram
    autonumber
    participant LK as srv:LayananKebun
    participant RMQ as rmq:RabbitMQ
    participant LT as srv:LayananTernak
    participant DB as db:Database

    %% Event Trigger di Kebun
    Note over LK, RMQ: 1. Publikasi Event dari Kebun
    LK->>RMQ: publishEvent(crop_residue_distributed)
    Note right of LK: Event payload berisi:<br/>- Jenis Pakan (daun/rumput)<br/>- Jumlah (kg)<br/>- ID Sumber

    %% Event Consumed di Peternakan
    Note over RMQ, DB: 2. Konsumsi Event & Update Stok Pakan di Peternakan
    RMQ->>LT: kirimPesanEvent()
    activate LT
    LT->>DB: selectStokPakanByName(feed_name)
    DB-->>LT: Data stok pakan
    
    alt Stok pakan sudah ada
        LT->>DB: tambahJumlahStokPakan(jumlah)
    else Stok pakan belum ada
        LT->>DB: insertStokPakanBaru()
    end
    
    LT-->>RMQ: konfirmasiPenerimaan(ACK)
    deactivate LT
```
