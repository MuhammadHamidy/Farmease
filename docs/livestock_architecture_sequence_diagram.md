# Desain Arsitektur: Sequence Diagram Sistem Peternakan (Farmease)

Dokumen ini memuat diagram urutan (*sequence diagram*) arsitektur untuk menggambarkan bagaimana data mengalir di dalam sistem Peternakan Farmease, memetakan alur konseptual antara aktor, antarmuka frontend, backend, dan database.

---

## 1. Diagram Alur Pengajuan & Persetujuan Pencatatan (Submission & Approval Workflow)

Diagram ini mengilustrasikan alur ketika seorang Operator mengajukan pencatatan baru (seperti penimbangan bobot atau kesehatan) hingga disetujui oleh Admin dan memperbarui kondisi data domba di database.

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
    UI->>SS: CreateSubmission(sub)
    activate SS
    SS->>DB: Store(sub)
    SS->>DB: SendNotification(notif)
    SS-->>UI: Pengajuan berhasil disimpan
    deactivate SS
    UI-->>Operator: Menampilkan status "Menunggu Persetujuan"

    %% Fase Peninjauan oleh Admin
    Note over UI, Admin: Fase 2: Peninjauan & Persetujuan Admin (Review & Approve)
    Admin->>UI: Buka halaman Persetujuan (Pencatatan Baru)
    UI->>SS: GetSubmissions(status="pending")
    activate SS
    SS->>DB: FindAll(status="pending")
    DB-->>SS: Daftar pengajuan pending
    SS-->>UI: Return daftar pengajuan
    deactivate SS
    UI-->>Admin: Menampilkan daftar pengajuan tertunda

    Admin->>UI: Klik "Setujui" (Approve)
    UI->>SS: ApproveSubmission(id)
    activate SS
    SS->>DB: UpdateStatus(id, status="approved")
    
    rect rgb(230, 245, 230)
        Note over SS, DB: Fase 3: Pembaruan Data Domain Utama
        SS->>DB: StoreWeightRecord() / StoreHealthRecord()
        SS->>DB: UpdateLastWeight() / UpdateHealthStatus()
    end

    SS->>DB: SendNotification(targetOperator)
    SS-->>UI: Validasi persetujuan selesai
    deactivate SS
    UI-->>Admin: Menampilkan notifikasi sukses persetujuan
```

---

## 2. Diagram Alur Distribusi Sisa Panen (Gardening Crop Residue Integration)

Diagram ini menggambarkan integrasi asinkron (*event-driven*) menggunakan broker pesan RabbitMQ untuk menyalurkan sisa hasil pemangkasan/kebun perkebunan sebagai stok pakan ternak.

```mermaid
sequenceDiagram
    autonumber
    participant LK as srv:LayananKebun
    participant RMQ as rmq:RabbitMQ
    participant FS as fs:FeedService
    participant DB as db:Database

    %% Event Trigger di Kebun
    Note over LK, RMQ: 1. Publikasi Event dari Kebun
    LK->>RMQ: publishEvent(crop_residue_distributed)
    Note right of LK: Event payload berisi:<br/>- Jenis Pakan (daun/rumput)<br/>- Jumlah (kg)<br/>- ID Sumber

    %% Event Consumed di Peternakan
    Note over RMQ, DB: 2. Konsumsi Event & Update Stok Pakan di Peternakan
    RMQ->>FS: HandleCropResidueEvent(payload)
    activate FS
    FS->>DB: FindMasterByID(id_feed)
    DB-->>FS: Data stok pakan
    
    alt Stok pakan sudah ada
        FS->>DB: UpdateStock(id_feed, amount, "tambah")
    else Stok pakan belum ada
        FS->>DB: StoreMaster(feed)
    end
    
    FS-->>RMQ: konfirmasiPenerimaan(ACK)
    deactivate FS
```
