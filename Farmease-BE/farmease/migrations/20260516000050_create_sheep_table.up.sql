CREATE SCHEMA IF NOT EXISTS livestock;

CREATE TABLE IF NOT EXISTS livestock.sheep (
    id_sheep SERIAL PRIMARY KEY,
    sheep_code VARCHAR(20) UNIQUE NOT NULL,
    sheep_name VARCHAR(100),
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
    origin VARCHAR(50),
    id_cage INT REFERENCES master.cages(id_cage),
    id_type INT REFERENCES master.sheep_types(id_type),
    id_sire INT REFERENCES livestock.sheep(id_sheep),
    id_dam INT REFERENCES livestock.sheep(id_sheep),
    created_by INT REFERENCES auth.accounts(id_account),
    updated_by INT REFERENCES auth.accounts(id_account),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sheep_code ON livestock.sheep(sheep_code);
CREATE INDEX IF NOT EXISTS idx_sheep_cage ON livestock.sheep(id_cage);
