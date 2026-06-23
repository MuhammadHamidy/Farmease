-- Down migration to revert changes (restoring original migration structure)

-- 1. Revert gardening.lahan additions
ALTER TABLE gardening.lahan 
DROP COLUMN IF EXISTS varietas,
DROP COLUMN IF EXISTS kapasitas_maksimal,
DROP COLUMN IF EXISTS tanggal_tanam,
DROP COLUMN IF EXISTS fase_tanam;

DROP TABLE IF EXISTS gardening.perawatan CASCADE;
DROP TABLE IF EXISTS gardening.panen CASCADE;
DROP TABLE IF EXISTS gardening.pemangkasan CASCADE;
DROP TABLE IF EXISTS gardening.pohon CASCADE;

CREATE TABLE IF NOT EXISTS gardening.pohon (
    id_pohon               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pohon             VARCHAR(50) UNIQUE NOT NULL,
    varietas               VARCHAR(100) NOT NULL DEFAULT '',
    nomor_baris            VARCHAR(20) NOT NULL DEFAULT '',
    status_pohon           VARCHAR(50) NOT NULL DEFAULT 'Produktif',
    BlokLahan_id_blok      UUID NOT NULL REFERENCES gardening.blok_lahan(id_blok) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gardening.pemangkasan (
    id_pemangkasan         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jumlah_hasil           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT 'kg',
    kesediaan              VARCHAR(100) NOT NULL DEFAULT '',
    keterangan             TEXT NOT NULL DEFAULT '',
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gardening.panen (
    id_panen               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jumlah_panen           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30) NOT NULL DEFAULT 'kg',
    keterangan             TEXT NOT NULL DEFAULT '',
    Lahan_id_lahan         UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gardening.perawatan (
    id_perawatan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis_bahan            gardening.jenis_bahan_enum NOT NULL DEFAULT 'umum',
    fase_pohon             gardening.fase_pohon_enum NOT NULL DEFAULT 'Vegetatif',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT '',
    bagian_pohon           gardening.bagian_pohon_enum NOT NULL DEFAULT 'Umum',
    teknik_perawatan       VARCHAR(100) NOT NULL DEFAULT '',
    detail_pohon           VARCHAR(255) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    JenisObat_id_jenis_obat UUID REFERENCES gardening.jenis_obat(id_jenis_obat) ON DELETE SET NULL,
    Lahan_id_lahan         UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);
