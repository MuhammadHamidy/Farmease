CREATE SCHEMA IF NOT EXISTS livestock;

DO $$ BEGIN
    CREATE TYPE livestock.gender_enum AS ENUM ('jantan', 'betina');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE livestock.sheep_status_enum AS ENUM ('aktif', 'hamil', 'dijual', 'mati', 'disembelih', 'eksternal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS livestock.sheep (
    id_sheep UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheep_code VARCHAR(20) UNIQUE NOT NULL,
    sheep_name VARCHAR(100),
    gender livestock.gender_enum NOT NULL,
    date_of_birth DATE,
    status livestock.sheep_status_enum NOT NULL DEFAULT 'aktif',
    origin VARCHAR(50),
    id_cage UUID REFERENCES master.cages(id_cage),
    id_type UUID REFERENCES master.sheep_types(id_type),
    id_father UUID REFERENCES livestock.sheep(id_sheep),
    id_mother UUID REFERENCES livestock.sheep(id_sheep),
    photo_url VARCHAR(255),
    owner VARCHAR(100) DEFAULT '',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sheep_code ON livestock.sheep(sheep_code);
CREATE INDEX IF NOT EXISTS idx_sheep_cage ON livestock.sheep(id_cage);
