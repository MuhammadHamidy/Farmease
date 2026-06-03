CREATE TABLE IF NOT EXISTS gardening.pengingat_jadwal (
    id_pengingat_jadwal SERIAL PRIMARY KEY,
    tanggal TIMESTAMP NOT NULL,
    kategori_jadwal VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    interval VARCHAR(50) NOT NULL,
    status_pencatatan VARCHAR(50) NOT NULL,
    keterangan TEXT NOT NULL,
    Lahan_id_lahan INT REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Aktivitas_id_aktivitas INT REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);

