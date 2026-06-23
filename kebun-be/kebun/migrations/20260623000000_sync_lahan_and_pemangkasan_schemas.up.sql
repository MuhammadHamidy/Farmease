-- Up migration to synchronize gardening schemas with Go repository expectations

-- 1. Alter gardening.lahan to add missing columns
ALTER TABLE gardening.lahan 
ADD COLUMN IF NOT EXISTS varietas VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS kapasitas_maksimal INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tanggal_tanam TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS fase_tanam VARCHAR(50) NOT NULL DEFAULT 'Pembibitan';

-- 2. Drop and Recreate gardening.pohon
DROP TABLE IF EXISTS gardening.pohon CASCADE;
CREATE TABLE gardening.pohon (
    id_pohon               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pohon             VARCHAR(50) UNIQUE NOT NULL,
    tanggal_tanam          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    varietas               VARCHAR(100) NOT NULL DEFAULT '',
    fase_pohon             VARCHAR(50) NOT NULL DEFAULT 'Pembibitan',
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

-- 3. Drop and Recreate gardening.pemangkasan
DROP TABLE IF EXISTS gardening.pemangkasan CASCADE;
CREATE TABLE gardening.pemangkasan (
    id_pemangkasan         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas   VARCHAR(100) NOT NULL DEFAULT 'Pemangkasan',
    nama_rincian_aktivitas VARCHAR(100) NOT NULL DEFAULT '',
    jumlah                 NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT 'kg',
    keterangan             TEXT NOT NULL DEFAULT '',
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE SET NULL
);

-- 4. Drop and Recreate gardening.panen
DROP TABLE IF EXISTS gardening.panen CASCADE;
CREATE TABLE gardening.panen (
    id_panen               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas   VARCHAR(100) NOT NULL DEFAULT 'Panen',
    nama_rincian_aktivitas VARCHAR(100) NOT NULL DEFAULT '',
    jumlah                 NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT 'kg',
    keterangan             TEXT NOT NULL DEFAULT '',
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE SET NULL
);

-- 5. Drop and Recreate gardening.perawatan
DROP TABLE IF EXISTS gardening.perawatan CASCADE;
CREATE TABLE gardening.perawatan (
    id_perawatan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas   VARCHAR(100) NOT NULL DEFAULT 'Perawatan',
    nama_rincian_aktivitas VARCHAR(100) NOT NULL DEFAULT '',
    jenis_bahan            VARCHAR(50) NOT NULL DEFAULT 'umum',
    fase_pohon             VARCHAR(50) NOT NULL DEFAULT 'Vegetatif',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT '',
    bagian_pohon           VARCHAR(50) NOT NULL DEFAULT 'Umum',
    teknik_perawatan       VARCHAR(100) NOT NULL DEFAULT '',
    nama_obat              VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    detail_pohon           VARCHAR(255) NOT NULL DEFAULT '',
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE SET NULL
);
