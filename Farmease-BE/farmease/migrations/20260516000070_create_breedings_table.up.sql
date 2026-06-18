CREATE SCHEMA IF NOT EXISTS breeding;

DO $$ BEGIN
    CREATE TYPE breeding.mating_method_enum AS ENUM ('alami', 'ib');
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

CREATE TABLE IF NOT EXISTS breeding.pregnancies (
    id_pregnancy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_mating UUID NOT NULL REFERENCES breeding.matings(id_mating) ON DELETE CASCADE,
    pregnancy_date DATE NOT NULL,
    pregnancy_status breeding.pregnancy_status_enum NOT NULL DEFAULT 'dikandung',
    expected_birth_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS breeding.births (
    id_birth UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pregnancy UUID NOT NULL REFERENCES breeding.pregnancies(id_pregnancy) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    number_of_offspring INT NOT NULL,
    offspring_gender breeding.offspring_gender_enum,
    offspring_condition breeding.offspring_condition_enum,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);