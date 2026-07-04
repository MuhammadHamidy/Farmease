CREATE SCHEMA IF NOT EXISTS operations;

DO $$ BEGIN
    CREATE TYPE operations.task_status_enum AS ENUM ('belum', 'proses', 'selesai', 'terlambat', 'pending', 'done', 'menunggu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS operations.tasks (
    id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date TIMESTAMP WITH TIME ZONE,
    status operations.task_status_enum DEFAULT 'pending',
    priority operations.priority_enum DEFAULT 'sedang',
    id_account UUID,
    category operations.task_category_enum,
    end_time VARCHAR(255) DEFAULT '',
    schedule_id UUID REFERENCES operations.routine_schedules(id) ON DELETE CASCADE,
    id_cage UUID REFERENCES livestock.cages(id_cage) ON DELETE SET NULL,
    start_time TIME,
    rincian operations.task_rincian_enum,
    id_mating UUID NULL REFERENCES breeding.matings(id_mating) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_id_mating ON operations.tasks(id_mating);
