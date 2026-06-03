CREATE TABLE IF NOT EXISTS logistics.manures (
    id_manure SERIAL PRIMARY KEY,
    id_sheep INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    activity_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    external_destination_id VARCHAR(100),
    destination_type VARCHAR(50) DEFAULT 'internal',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manures_external_dest ON logistics.manures(external_destination_id);