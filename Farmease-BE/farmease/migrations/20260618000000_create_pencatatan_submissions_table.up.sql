CREATE TABLE IF NOT EXISTS operations.pencatatan_submissions (
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
    task_id UUID NULL REFERENCES operations.tasks(id_task) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pencatatan_submissions_status ON operations.pencatatan_submissions(approval_status);
CREATE INDEX IF NOT EXISTS idx_pencatatan_submissions_operator ON operations.pencatatan_submissions(operator_code);
