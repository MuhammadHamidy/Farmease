CREATE TABLE IF NOT EXISTS gardening.panen (
    id_panen SERIAL PRIMARY KEY,
    Aktivitas_id_aktivitas INT NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    jumlah INT NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    Lahan_id_lahan INT NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

