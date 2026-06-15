CREATE SCHEMA IF NOT EXISTS operations;

DO $$ BEGIN
    CREATE TYPE operations.task_category_enum AS ENUM ('pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'penyiraman', 'pemupukan', 'pembersihan', 'pemangkasan', 'panen', 'weighing', 'maintenance', 'admin', 'umum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.frequency_enum AS ENUM ('sekali', 'harian', 'mingguan', 'bulanan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.priority_enum AS ENUM ('rendah', 'sedang', 'tinggi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.task_rincian_enum AS ENUM ('Pakan Pagi', 'Pakan Sore', 'Konversi Pakan', 'Pemberian Obat', 'Pemberian Vitamin', 'Vaksinasi', 'Pemeriksaan Medis', 'Pembersihan Kandang', 'Fermentasi Kotoran', 'Kawin Alami', 'Inseminasi Buatan', 'Pencatatan Kelahiran', 'Pemeriksaan Anak & Induk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS operations.routine_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        operations.task_category_enum,
    frequency       operations.frequency_enum NOT NULL,
    days_of_week    INT[],
    day_of_month    INT,
    start_date      DATE NOT NULL,
    end_date        DATE,
    start_time      TIME,
    end_time        TIME,
    priority        operations.priority_enum DEFAULT 'sedang',
    id_cage         UUID REFERENCES master.cages(id_cage) ON DELETE SET NULL,
    id_account      UUID REFERENCES auth.accounts(id_account) ON DELETE SET NULL,
    rincian         operations.task_rincian_enum,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate active schedules: same title+category+cage+account can only exist once
CREATE UNIQUE INDEX IF NOT EXISTS uq_routine_schedules_active
    ON operations.routine_schedules (title, category, COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
    WHERE is_active = TRUE;
