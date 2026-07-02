-- Drop index
DROP INDEX IF EXISTS logistics.idx_manures_cage_id;

-- Remove id_cage column
ALTER TABLE logistics.manures DROP COLUMN IF EXISTS id_cage;

-- Make id_sheep NOT NULL (Warning: this might fail if there are records with null id_sheep, but it is standard for down migration)
ALTER TABLE logistics.manures ALTER COLUMN id_sheep SET NOT NULL;
