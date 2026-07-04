CREATE SCHEMA IF NOT EXISTS breeding;

DO $$ BEGIN
    CREATE TYPE breeding.mating_method_enum AS ENUM ('alami', 'inseminasi buatan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breeding.mating_status_enum AS ENUM ('proses', 'sukses', 'gagal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breeding.pregnancy_status_enum AS ENUM ('dikandung', 'melahirkan', 'keguguran');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breeding.offspring_gender_enum AS ENUM ('jantan', 'betina', 'campuran');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breeding.offspring_condition_enum AS ENUM ('sehat', 'lemas', 'cacat', 'mati');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS breeding.matings (
    id_mating UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep_male UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    id_sheep_female UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    mating_date DATE NOT NULL,
    mating_method breeding.mating_method_enum NOT NULL,
    status breeding.mating_status_enum NOT NULL DEFAULT 'proses',
    inbreeding_flag BOOLEAN DEFAULT FALSE,
    coefficient_of_inbreeding DECIMAL(10,8) DEFAULT 0.0,
    notes TEXT,
    straw_code VARCHAR(100) NULL,
    inseminator VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);