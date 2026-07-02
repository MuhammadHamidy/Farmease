CREATE TABLE IF NOT EXISTS operations.notifications (
    id_notification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    id_account UUID NOT NULL,
    type VARCHAR(50),
    task_id UUID REFERENCES operations.tasks(id_task) ON DELETE SET NULL,
    submission_id UUID REFERENCES operations.pencatatan_submissions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
