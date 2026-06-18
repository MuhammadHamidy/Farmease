CREATE SCHEMA IF NOT EXISTS gardening;

DO $$ BEGIN
    CREATE TYPE gardening.task_category_enum AS ENUM (
        'pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 
        'penyiraman', 'pemupukan', 'pembersihan', 'pemangkasan', 'panen', 
        'weighing', 'maintenance', 'admin', 'umum'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gardening.frequency_enum AS ENUM ('sekali', 'harian', 'mingguan', 'bulanan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gardening.priority_enum AS ENUM ('rendah', 'sedang', 'tinggi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gardening.task_rincian_enum AS ENUM (
        'Pakan Pagi', 'Pakan Sore', 'Konversi Pakan', 'Pemberian Obat', 'Pemberian Vitamin', 
        'Vaksinasi', 'Pemeriksaan Medis', 'Pembersihan Kandang', 'Fermentasi Kotoran', 
        'Kawin Alami', 'Inseminasi Buatan', 'Pencatatan Kelahiran', 'Pemeriksaan Anak & Induk',
        'Kontrol Kebuntingan', 'Penyiraman Rutin', 'Pupuk Organik', 'Pupuk Padat', 'Pupuk Cair', 
        'Ranting dan Daun', 'Panen Buah', 'Limbah'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gardening.task_status_enum AS ENUM ('belum', 'proses', 'selesai', 'terlambat', 'pending', 'done', 'menunggu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS gardening.routine_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        gardening.task_category_enum,
    frequency       gardening.frequency_enum NOT NULL,
    days_of_week    INT[],
    day_of_month    INT,
    start_date      DATE NOT NULL,
    end_date        DATE,
    start_time      TIME,
    end_time        TIME,
    priority        gardening.priority_enum DEFAULT 'sedang',
    id_cage         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE SET NULL,
    id_account      UUID,
    rincian         gardening.task_rincian_enum,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_gardening_routine_schedules_active
    ON gardening.routine_schedules (title, category, COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
    WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS gardening.tasks (
    id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date TIMESTAMP WITH TIME ZONE,
    status gardening.task_status_enum DEFAULT 'pending',
    priority gardening.priority_enum DEFAULT 'sedang',
    id_account UUID,
    category gardening.task_category_enum,
    end_time VARCHAR(255) DEFAULT '',
    schedule_id UUID REFERENCES gardening.routine_schedules(id) ON DELETE CASCADE,
    id_cage UUID REFERENCES gardening.lahan(id_lahan) ON DELETE SET NULL,
    start_time TIME,
    rincian gardening.task_rincian_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.pencatatan_submissions (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    type_label VARCHAR(100) NOT NULL,
    operator_code VARCHAR(100) NOT NULL,
    operator_name VARCHAR(255) NOT NULL,
    cage_code VARCHAR(50) NOT NULL,
    scope VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    payload JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    reviewed_by VARCHAR(255) NULL,
    review_note TEXT NULL,
    task_id UUID NULL REFERENCES gardening.tasks(id_task) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gardening_pencatatan_submissions_status ON gardening.pencatatan_submissions(approval_status);
CREATE INDEX IF NOT EXISTS idx_gardening_pencatatan_submissions_operator ON gardening.pencatatan_submissions(operator_code);

CREATE TABLE IF NOT EXISTS gardening.notifications (
    id_notification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    id_account UUID NOT NULL,
    type VARCHAR(50),
    task_id UUID REFERENCES gardening.tasks(id_task) ON DELETE SET NULL,
    submission_id VARCHAR(100) REFERENCES gardening.pencatatan_submissions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
