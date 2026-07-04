DO $$ BEGIN
    CREATE TYPE livestock.manure_activity_enum AS ENUM ('collection', 'fermentation', 'distribution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE livestock.manure_dest_enum AS ENUM ('internal', 'internal_kebun', 'external_sale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS livestock.manures (
    id_manure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    id_cage UUID REFERENCES livestock.cages(id_cage) ON DELETE CASCADE,
    activity_type livestock.manure_activity_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    external_destination_id VARCHAR(100),
    destination_type livestock.manure_dest_enum DEFAULT 'internal',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manures_cage_id ON livestock.manures(id_cage);

CREATE INDEX IF NOT EXISTS idx_manures_external_dest ON livestock.manures(external_destination_id);