-- Drop created_at and updated_at columns from gardening schema tables
ALTER TABLE gardening.lahan DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.pohon DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.aktivitas DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.perawatan DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.pemangkasan DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.panen DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
ALTER TABLE gardening.akun_lahan DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;
