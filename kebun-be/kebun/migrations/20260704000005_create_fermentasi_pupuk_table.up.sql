CREATE TABLE IF NOT EXISTS gardening.fermentasi_pupuk (
    id_fermentasi          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_mulai          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    target_pupuk_name      VARCHAR(100) NOT NULL,
    target_jumlah          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30) NOT NULL DEFAULT 'kg',
    status                 VARCHAR(50) NOT NULL DEFAULT 'proses',
    notes                  TEXT,
    id_stok_bahan          UUID REFERENCES gardening.stok_bahan(id_stok_bahan) ON DELETE SET NULL,
    id_account             UUID,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
