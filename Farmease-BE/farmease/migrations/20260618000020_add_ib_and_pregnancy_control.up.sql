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
