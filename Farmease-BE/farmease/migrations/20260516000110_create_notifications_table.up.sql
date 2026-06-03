CREATE SCHEMA IF NOT EXISTS operations;

CREATE TABLE IF NOT EXISTS operations.notifications (
    id_notification SERIAL PRIMARY KEY,
    title VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    id_account INT NOT NULL REFERENCES auth.accounts(id_account) ON DELETE CASCADE,
    type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
