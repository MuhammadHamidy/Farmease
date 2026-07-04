CREATE TABLE IF NOT EXISTS gardening.stok_obat (
    id_stok_obat           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_obat              VARCHAR(100) NOT NULL,
    stok_tersedia          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30) NOT NULL DEFAULT 'liter',
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add relations directly to pre-existing tables that use it
ALTER TABLE gardening.pengobatan 
ADD COLUMN IF NOT EXISTS id_stok_obat UUID REFERENCES gardening.stok_obat(id_stok_obat) ON DELETE SET NULL;
