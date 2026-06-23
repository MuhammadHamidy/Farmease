-- Tabel pohon — data per-pohon dalam blok lahan
-- Pohon dikelompokkan dalam blok_lahan (bukan langsung ke lahan)
CREATE TABLE IF NOT EXISTS gardening.pohon (
    id_pohon               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pohon             VARCHAR(50)  UNIQUE NOT NULL,
    -- Contoh: 'PHN-A1-001', 'PHN-B2-012'

    varietas               VARCHAR(100) NOT NULL DEFAULT '',
    -- Contoh: 'Aligator', 'Mentega', 'Iteng' (untuk Alpukat)

    nomor_baris            VARCHAR(20)  NOT NULL DEFAULT '',
    -- Nomor baris dalam blok, contoh: 'B1', 'B3'

    status_pohon           VARCHAR(50)  NOT NULL DEFAULT 'Produktif',
    -- Nilai: 'Produktif', 'Sakit', 'Mati', 'Baru Tanam', 'Tidak Produktif'

    -- Relasi ke blok lahan (bukan langsung ke lahan)
    BlokLahan_id_blok      UUID NOT NULL REFERENCES gardening.blok_lahan(id_blok) ON DELETE CASCADE
);
