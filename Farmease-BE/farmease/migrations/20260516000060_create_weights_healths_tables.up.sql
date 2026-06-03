CREATE TABLE IF NOT EXISTS livestock.weights (
    id_weight SERIAL PRIMARY KEY,
    id_sheep INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    weighing_date DATE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS livestock.healths (
    id_health SERIAL PRIMARY KEY,
    id_sheep INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    checkup_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    action TEXT,
    medicine_given TEXT,
    inspector_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);