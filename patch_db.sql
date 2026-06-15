-- ============================================================
-- PATCH: Tambahkan tabel operations.routine_schedules dan
--        kolom schedule_id, start_time, rincian ke tasks
-- Jalankan: docker exec -i farmease_postgres psql -U user -d farmease_be -f /patch.sql
-- ============================================================

-- 1. Buat schema operations jika belum ada
CREATE SCHEMA IF NOT EXISTS operations;

-- 2. Buat tabel routine_schedules jika belum ada
CREATE TABLE IF NOT EXISTS operations.routine_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT,
    frequency       TEXT NOT NULL,
    days_of_week    INT[],
    day_of_month    INT,
    start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,
    start_time      TIME,
    end_time        TIME,
    priority        TEXT DEFAULT 'sedang',
    id_cage         UUID REFERENCES master.cages(id_cage) ON DELETE SET NULL,
    id_account      UUID REFERENCES auth.accounts(id_account) ON DELETE SET NULL,
    rincian         TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tambahkan kolom schedule_id ke tasks jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'operations'
          AND table_name = 'tasks'
          AND column_name = 'schedule_id'
    ) THEN
        ALTER TABLE operations.tasks
        ADD COLUMN schedule_id UUID REFERENCES operations.routine_schedules(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- 4. Tambahkan kolom start_time ke tasks jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'operations'
          AND table_name = 'tasks'
          AND column_name = 'start_time'
    ) THEN
        ALTER TABLE operations.tasks
        ADD COLUMN start_time TIME;
    END IF;
END;
$$;

-- 5. Tambahkan kolom rincian ke tasks jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'operations'
          AND table_name = 'tasks'
          AND column_name = 'rincian'
    ) THEN
        ALTER TABLE operations.tasks
        ADD COLUMN rincian TEXT;
    END IF;
END;
$$;

-- 6. Tambahkan kolom id_cage ke tasks jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'operations'
          AND table_name = 'tasks'
          AND column_name = 'id_cage'
    ) THEN
        ALTER TABLE operations.tasks
        ADD COLUMN id_cage UUID REFERENCES master.cages(id_cage) ON DELETE SET NULL;
    END IF;
END;
$$;

-- 7. Tambahkan kolom priority ke tasks jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'operations'
          AND table_name = 'tasks'
          AND column_name = 'priority'
    ) THEN
        ALTER TABLE operations.tasks
        ADD COLUMN priority VARCHAR(20) DEFAULT 'sedang';
    END IF;
END;
$$;

-- Konfirmasi
SELECT 'routine_schedules table OK' AS status
FROM information_schema.tables
WHERE table_schema = 'operations' AND table_name = 'routine_schedules';

SELECT 'tasks.schedule_id column OK' AS status
FROM information_schema.columns
WHERE table_schema = 'operations' AND table_name = 'tasks' AND column_name = 'schedule_id';
