CREATE TABLE IF NOT EXISTS gardening.stok_bahan (
    id_stok_bahan          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_bahan             VARCHAR(100) NOT NULL,
    stok_tersedia          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30) NOT NULL DEFAULT 'kg',
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add relations directly to pre-existing tables that use it
ALTER TABLE gardening.pembersihan 
ADD COLUMN IF NOT EXISTS id_stok_bahan UUID REFERENCES gardening.stok_bahan(id_stok_bahan) ON DELETE SET NULL;

ALTER TABLE gardening.pemangkasan 
ADD COLUMN IF NOT EXISTS id_stok_bahan UUID REFERENCES gardening.stok_bahan(id_stok_bahan) ON DELETE SET NULL;
