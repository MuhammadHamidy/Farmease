-- Tabel panen — mencatat hasil panen buah
CREATE TABLE IF NOT EXISTS gardening.panen (
    id_panen               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Jumlah hasil panen
    jumlah                 NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30)   NOT NULL DEFAULT 'kg',
    -- Contoh: 'kg', 'buah', 'ikat', 'ton'

    -- Keterangan kondisi panen, kualitas buah, dll.
    keterangan             TEXT          NOT NULL DEFAULT '',

    -- Relasi ke lahan
    Lahan_id_lahan         UUID NOT NULL REFERENCES gardening.lahan(id_lahan)         ON DELETE CASCADE,
    -- Relasi wajib ke aktivitas
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
