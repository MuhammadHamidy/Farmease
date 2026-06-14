CREATE SCHEMA IF NOT EXISTS operations;

CREATE TABLE IF NOT EXISTS operations.tasks (
    id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'sedang',
    id_account UUID REFERENCES auth.accounts(id_account) ON DELETE CASCADE,
    category VARCHAR(50),
    end_time VARCHAR(255) DEFAULT '',
    schedule_id UUID REFERENCES operations.routine_schedules(id) ON DELETE SET NULL,
    id_cage UUID REFERENCES master.cages(id_cage) ON DELETE SET NULL,
    start_time TIME,
    rincian TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
