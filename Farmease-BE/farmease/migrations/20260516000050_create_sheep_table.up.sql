CREATE SCHEMA IF NOT EXISTS livestock;

CREATE TABLE IF NOT EXISTS livestock.sheep (
    id_sheep UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheep_code VARCHAR(20) UNIQUE NOT NULL,
    sheep_name VARCHAR(100),
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
    origin VARCHAR(50),
    id_cage UUID REFERENCES master.cages(id_cage),
    id_type UUID REFERENCES master.sheep_types(id_type),
    id_father UUID REFERENCES livestock.sheep(id_sheep),
    id_mother UUID REFERENCES livestock.sheep(id_sheep),
    created_by UUID REFERENCES auth.accounts(id_account),
    updated_by UUID REFERENCES auth.accounts(id_account),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sheep_code ON livestock.sheep(sheep_code);
CREATE INDEX IF NOT EXISTS idx_sheep_cage ON livestock.sheep(id_cage);
