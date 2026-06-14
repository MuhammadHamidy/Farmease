CREATE TABLE IF NOT EXISTS master.cages (
    id_cage UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cage_code VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    cage_type VARCHAR(20) NOT NULL,
    cage_name VARCHAR(100),
    farm_id UUID REFERENCES master.farms(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cages_farm_id ON master.cages(farm_id);
