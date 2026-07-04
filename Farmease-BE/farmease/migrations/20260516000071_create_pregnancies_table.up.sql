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
