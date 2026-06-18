CREATE TABLE IF NOT EXISTS gardening.panen (
    id_panen UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    jumlah INT NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    Lahan_id_lahan UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

