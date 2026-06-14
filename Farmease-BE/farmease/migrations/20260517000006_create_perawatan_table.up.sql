CREATE TABLE IF NOT EXISTS gardening.perawatan (
    id_perawatan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    jenis_bahan VARCHAR(100) NOT NULL,
    fase_pohon VARCHAR(100) NOT NULL DEFAULT '',
    dosis DECIMAL(10, 2) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    bagian_pohon VARCHAR(100) NOT NULL DEFAULT '',
    teknik_perawatan VARCHAR(100) NOT NULL DEFAULT '',
    nama_obat VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi TEXT NOT NULL DEFAULT '',
    detail_pohon VARCHAR(150) NOT NULL DEFAULT '',
    Lahan_id_lahan UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

