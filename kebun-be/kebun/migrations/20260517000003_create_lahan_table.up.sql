CREATE SCHEMA IF NOT EXISTS gardening;

-- ENUM: fase pohon (digunakan di tabel pohon & perawatan)
DO $$ BEGIN
    CREATE TYPE gardening.fase_pohon_enum AS ENUM (
        'Pembibitan', 'Vegetatif', 'Generatif', 'Panen', 'Tidak Produktif'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ENUM: bagian pohon yang dirawat (digunakan di perawatan)
DO $$ BEGIN
    CREATE TYPE gardening.bagian_pohon_enum AS ENUM (
        'Daun', 'Akar', 'Batang', 'Buah', 'Bunga', 'Lahan', 'Tanah', 'Umum'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ENUM: jenis bahan perawatan (digunakan di perawatan)
DO $$ BEGIN
    CREATE TYPE gardening.jenis_bahan_enum AS ENUM (
        'obat', 'pupuk', 'pembersihan', 'air', 'bibit', 'hormon', 'umum'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tabel utama lahan perkebunan
-- Kolom: kode_lahan, nama_lahan, jenis_tanaman, status_lahan, luas_lahan
CREATE TABLE IF NOT EXISTS gardening.lahan (
    id_lahan      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_lahan    VARCHAR(50)  UNIQUE NOT NULL,
    nama_lahan    VARCHAR(100) NOT NULL DEFAULT '',
    jenis_tanaman VARCHAR(100) NOT NULL DEFAULT '',
    -- Contoh: 'Alpukat', 'Kelengkeng'
    status_lahan  INT          NOT NULL DEFAULT 1,
    -- 1 = Aktif, 0 = Tidak Aktif
    luas_lahan    NUMERIC(10,2) NOT NULL DEFAULT 0.00
    -- Dalam satuan m²
);
