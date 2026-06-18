CREATE TABLE IF NOT EXISTS gardening.pemangkasan (
    id_pemangkasan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    jumlah VARCHAR(50) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    keterangan TEXT NOT NULL,
    Lahan_id_lahan UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

