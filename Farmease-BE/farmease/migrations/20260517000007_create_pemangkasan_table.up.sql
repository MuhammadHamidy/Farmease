CREATE TABLE IF NOT EXISTS gardening.pemangkasan (
    id_pemangkasan SERIAL PRIMARY KEY,
    Aktivitas_id_aktivitas INT NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    jumlah VARCHAR(50) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    keterangan TEXT NOT NULL,
    Lahan_id_lahan INT REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

