-- Tabel pohon — data per-pohon dalam lahan
CREATE TABLE IF NOT EXISTS gardening.pohon (
    id_pohon               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pohon             VARCHAR(50)  UNIQUE NOT NULL,
    varietas               VARCHAR(100) NOT NULL DEFAULT '',
    tanggal_tanam          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fase_pohon             gardening.fase_pohon_enum  NOT NULL DEFAULT 'Vegetatif',
    "Lahan_id_lahan"       UUID         NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);
