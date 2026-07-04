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
