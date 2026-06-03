CREATE SCHEMA IF NOT EXISTS breeding;

CREATE TABLE IF NOT EXISTS breeding.matings (
    id_mating SERIAL PRIMARY KEY,
    id_sheep_male INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    id_sheep_female INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    mating_date DATE NOT NULL,
    mating_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'proses',
    inbreeding_flag BOOLEAN DEFAULT FALSE,
    coefficient_of_inbreeding DECIMAL(10,8) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS breeding.pregnancies (
    id_pregnancy SERIAL PRIMARY KEY,
    id_mating INT NOT NULL REFERENCES breeding.matings(id_mating) ON DELETE CASCADE,
    pregnancy_date DATE NOT NULL,
    pregnancy_status VARCHAR(20) NOT NULL DEFAULT 'dikandung',
    expected_birth_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS breeding.births (
    id_birth SERIAL PRIMARY KEY,
    id_pregnancy INT NOT NULL REFERENCES breeding.pregnancies(id_pregnancy) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    number_of_offspring INT NOT NULL,
    offspring_gender VARCHAR(20),
    offspring_condition VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);