CREATE TABLE IF NOT EXISTS gardening.pohon (
    id_pohon UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pohon VARCHAR(50) UNIQUE NOT NULL,
    tanggal_tanam TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    varietas VARCHAR(100) NOT NULL DEFAULT '',
    fase_pohon VARCHAR(50) NOT NULL DEFAULT '',
    Lahan_id_lahan UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);
