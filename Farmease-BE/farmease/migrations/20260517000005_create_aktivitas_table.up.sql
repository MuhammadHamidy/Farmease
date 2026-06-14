CREATE TABLE IF NOT EXISTS gardening.aktivitas (
    id_aktivitas UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas VARCHAR(100) NOT NULL,
    nama_rincian_aktivitas VARCHAR(100) NOT NULL,
    Lahan_id_lahan UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

