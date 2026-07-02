-- Alter id_sheep column to be nullable
ALTER TABLE logistics.manures ALTER COLUMN id_sheep DROP NOT NULL;

-- Add id_cage column referencing master.cages
ALTER TABLE logistics.manures ADD COLUMN id_cage UUID REFERENCES master.cages(id_cage) ON DELETE CASCADE;

-- Create index for id_cage
CREATE INDEX IF NOT EXISTS idx_manures_cage_id ON logistics.manures(id_cage);
