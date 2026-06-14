CREATE TABLE IF NOT EXISTS operations.routine_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT,               -- pakan/kesehatan/kotoran/dll
    frequency       TEXT NOT NULL,      -- sekali | harian | mingguan | bulanan
    days_of_week    INT[],              -- [0,1,...,6] untuk mingguan (0=Minggu)
    day_of_month    INT,                -- 1-31 untuk bulanan
    start_date      DATE NOT NULL,      -- kapan jadwal mulai berlaku
    end_date        DATE,               -- kapan berakhir (NULL = tidak ada batas)
    start_time      TIME,               -- jam mulai (HH:MM)
    end_time        TIME,               -- jam tenggat (HH:MM)
    priority        TEXT DEFAULT 'sedang',
    id_cage         UUID REFERENCES master.cages(id_cage) ON DELETE SET NULL, -- FK ke cages
    id_account      UUID REFERENCES auth.accounts(id_account) ON DELETE SET NULL, -- FK ke accounts
    rincian         TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
