CREATE TABLE IF NOT EXISTS gardening.stok_pupuk (
    id_stok_pupuk          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_pupuk             VARCHAR(100) NOT NULL,
    kategori               VARCHAR(50) NOT NULL,
    stok_tersedia          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30) NOT NULL DEFAULT 'kg',
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
