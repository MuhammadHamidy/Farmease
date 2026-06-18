-- (d) Hapus jembatan task -> mating dan index-nya
DROP INDEX IF EXISTS operations.idx_tasks_id_mating;
ALTER TABLE operations.tasks DROP COLUMN IF EXISTS id_mating;

-- (c) Hapus kolom tambahan khusus IB di breeding.matings
ALTER TABLE breeding.matings DROP COLUMN IF EXISTS straw_code;
ALTER TABLE breeding.matings DROP COLUMN IF EXISTS inseminator;

-- Note: Postgres does not support removing values from enums, so we leave task_rincian_enum and sheep_status_enum values as is.
