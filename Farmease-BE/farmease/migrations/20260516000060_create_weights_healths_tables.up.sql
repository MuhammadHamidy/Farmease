CREATE TABLE IF NOT EXISTS livestock.weights (
    id_weight UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    weighing_date DATE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);