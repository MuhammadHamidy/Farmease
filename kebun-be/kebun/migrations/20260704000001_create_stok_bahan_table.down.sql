ALTER TABLE gardening.pemangkasan DROP COLUMN IF EXISTS id_stok_bahan;
ALTER TABLE gardening.pembersihan DROP COLUMN IF EXISTS id_stok_bahan;
DROP TABLE IF EXISTS gardening.stok_bahan CASCADE;
