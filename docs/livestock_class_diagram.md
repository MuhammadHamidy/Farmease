# Desain Arsitektur: Class Diagram Backend Peternakan (Farmease)

Dokumen ini memuat **Class Diagram** utama yang memodelkan keseluruhan modul yang ada di dalam Go Backend Peternakan (`farmease-be`). Seluruh entitas saling terhubung menggunakan relasi standar UML, menggabungkan data (atribut) dan perilaku (metode) langsung di dalam kelas entitas utama sesuai dengan prinsip pemrograman berorientasi objek (OOP).

---

## Class Diagram Backend (`farmease-be`)

Diagram ini dimodelkan menggunakan format kelas Mermaid dengan seluruh atribut diatur sebagai private (`-`) dengan format `- nama_variabel : tipe_data`, serta metode publik (`+`) dengan format `+ nama_metode(parameter) : tipe_kembalian`.

```mermaid
classDiagram
    %% ==========================================
    %% ENTITAS & METODE (OOP CLASSES)
    %% ==========================================
    class Farm {
        - ID : uuid
        - Code : string
        - Name : string
        - Location : string
        - Description : string
        - CreatedAt : date
        - UpdatedAt : date
        + CreateFarm(farm : Farm) : bool
        + UpdateFarm(id : string, farm : Farm) : bool
    }

    class Cage {
        - IDCage : string
        - FarmID : string
        - CageCode : string
        - Capacity : int
        - CageType : string
        - CageName : string
        - Occupancy : int
        - CreatedAt : date
        - UpdatedAt : date
        + GetCageList(filter : CageFilter) : Cage[]
        + CreateCage(cage : Cage) : bool
        + GetCageStats() : CageStats
        + GetCageWeightStats() : CageWeightStats
    }

    class Sheep {
        - IDSheep : string
        - SheepCode : string
        - SheepName : string
        - Gender : string
        - Status : string
        - Origin : string
        - IDCage : string
        - LastWeight : float
        - CreatedAt : date
        - UpdatedAt : date
        + GetSheepList(filter : SheepFilter) : Sheep[]
        + RegisterSheep(s : Sheep) : bool
        + UpdateSheep(id : string, s : Sheep) : bool
        + UpdateSheepStatus(id : string, status : string, notes : string) : bool
        + GetSheepGenealogy() : Genealogy
    }

    class Mating {
        - IDMating : string
        - IDSheepMale : string
        - IDSheepFemale : string
        - MatingDate : date
        - Status : string
        + RecordMating(m : Mating) : bool
        + RecordEstrusCheck(ec : EstrusCheck) : bool
    }

    class Pregnancy {
        - IDPregnancy : string
        - IDSheepFemale : string
        - MatingDate : date
        - EstBirthDate : date
        - Status : string
        + RecordPregnancy(p : Pregnancy) : bool
        + RecordBirth(id : string, count : int) : bool
    }

    class Feed {
        - IDFeed : string
        - FeedName : string
        - AvailableStock : float
        - Unit : string
        + GetMasterFeedList() : Feed[]
        + AddMasterFeed(f : Feed) : bool
        + UpdateFeedStock(amount : float, type : string) : bool
        + RecordFeeding(f : Feeding) : bool
        + RecordSilageConversion(sc : SilageConversion) : bool
    }

    class Feeding {
        - IDFeeding : string
        - IDSheep : string
        - IDFeed : string
        - FeedingDate : date
        - Amount : float
    }

    class SilageFermentationLog {
        - IDLog : string
        - IDConversion : string
        - CheckDate : date
        - Status : string
        - PHLevel : float
        - Temperature : float
        - PhysicalCondition : string
        - Notes : string
        - CreatedAt : date
        + GetFermentationLogs(id : string) : SilageFermentationLog[]
        + CreateFermentationLog(l : SilageFermentationLog) : bool
    }

    class HealthRecord {
        - IDRecord : string
        - IDSheep : string
        - Diagnosis : string
        - MedicineName : string
        - Dosage : float
        - CreatedAt : date
        + RecordHealth(h : HealthRecord) : bool
        + GetHealthHistory(id : string) : HealthRecord[]
    }

    class WeightRecord {
        - IDLog : string
        - IDSheep : string
        - Weight : float
        - ADG : int
        - CreatedAt : date
        + RecordWeight(w : WeightRecord) : bool
        + GetWeightHistory(id : string) : WeightRecord[]
    }

    class ManureRecord {
        - IDLog : string
        - IDCage : string
        - Amount : float
        - CreatedAt : time.Time
        + RecordManure(m : ManureRecord) : bool
    }

    class Submission {
        - IDSubmission : string
        - Type : string
        - OperatorName : string
        - ApprovalStatus : string
        - Payload : object
        + CreateSubmission(sub : Submission) : bool
        + GetSubmissions(status : string) : Submission[]
        + ApproveSubmission() : bool
    }

    class Notification {
        - IDNotification : string
        - IDAccount : string
        - Title : string
        - Message : string
        - IsRead : bool
        - SubmissionID : string
    }

    class Task {
        - IDTask : string
        - Title : string
        - Description : string
        - Status : string
        - TaskDate : date
        - IDCage : string
        - IDAccount : string
        + GetMyTasks(id : string, role : string, date : date) : Task[]
        + CreateTask(t : Task) : bool
    }

    class RoutineSchedule {
        - IDSchedule : string
        - Title : string
        - Frequency : string
    }

    %% ==========================================
    %% NOTASI RELASI UML STANDAR
    %% ==========================================
    
    %% Komposisi: Farm tersusun dari Kandang (Kepemilikan Kuat)
    Farm "1" *-- "*" Cage : Composition

    %% Agregasi: Kandang menampung Domba (Kandang wadah sementara)
    Cage "1" --o "*" Sheep : Aggregation
    
    %% Komposisi: Log penimbangan & kesehatan bergantung sepenuhnya pada Domba
    Sheep "1" *-- "*" WeightRecord : Composition
    Sheep "1" *-- "*" HealthRecord : Composition
    
    %% Asosiasi: Relasi domba dengan aktivitas perkawinan/kehamilan
    Sheep "1" --> "*" Mating : Association (mating partner)
    Sheep "1" --> "*" Pregnancy : Association (mother)
    
    %% Komposisi: Log pemberian pakan & pupuk kandang bergantung pada Kandang
    Cage "1" *-- "*" Feeding : Composition
    Cage "1" *-- "*" ManureRecord : Composition
    
    %% Asosiasi: Kandang sebagai lokasi tugas
    Cage "1" --> "*" Task : Association (task location)
    
    %% Asosiasi: Relasi pakan dan fermentasi
    Feed "1" --> "*" Feeding : Association (consumed feed)
    Feed "1" --> "*" SilageFermentationLog : Association (fermentation material)
    
    %% Asosiasi: Relasi tugas dan jadwal
    Task "*" --> "1" RoutineSchedule : Association (generated by)
    Notification "1" --> "0..1" Submission : Association (links to)
    Submission "1" --> "0..1" Sheep : Association (contains payload of)
```

---

## Penjelasan Relasi UML Kelas Backend

1. **Komposisi (Composition - Berlian Hitam `*--`)**
   * `Farm` ke `Cage`: Menunjukkan hubungan kepemilikan yang kuat di mana jika `Farm` dihapus, seluruh `Cage` di dalamnya ikut terhapus (*cascade delete*).
   * `Sheep` ke `WeightRecord` & `HealthRecord`: Catatan timbangan atau rekam medis tidak dapat berdiri sendiri jika domba yang bersangkutan dihapus dari sistem.
   * `Cage` ke `Feeding` & `ManureRecord`: Log pemberian pakan kandang atau pembuangan kotoran kandang akan ikut terhapus jika kandang tersebut dihapus.
2. **Agregasi (Aggregation - Berlian Kosong `--o`)**
   * `Cage` ke `Sheep`: Hubungan wadah di mana `Sheep` dapat berpindah kandang, sehingga jika `Cage` dihapus, data `Sheep` tidak terhapus.
3. **Asosiasi (Association - Garis Panah Solid `-->`)**
   * Hubungan referensi atau keterkaitan antara dua objek mandiri (misal: `Feed` yang dirujuk di log `Feeding`, atau `Task` yang merujuk pada lokasi `Cage`).
