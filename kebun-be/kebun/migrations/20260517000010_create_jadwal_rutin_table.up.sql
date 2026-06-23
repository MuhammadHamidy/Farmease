CREATE TABLE IF NOT EXISTS gardening.jadwal_rutin (
    id_jadwal_rutin UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal TIMESTAMP NOT NULL,
    kategori_jadwal VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    interval VARCHAR(50) NOT NULL,
    status_pencatatan VARCHAR(50) NOT NULL,
    keterangan TEXT NOT NULL,
    jam_tenggat VARCHAR(255) DEFAULT '',
    Lahan_id_lahan UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);
