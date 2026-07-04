CREATE TABLE IF NOT EXISTS logistics.feedings (
    id_feeding UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    feeding_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
