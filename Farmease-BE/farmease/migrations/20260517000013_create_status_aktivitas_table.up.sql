CREATE TABLE IF NOT EXISTS gardening.status_aktivitas (
    id_status_aktivitas SERIAL PRIMARY KEY,
    Aktivitas_id_aktivitas INT NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    tanggal TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    keterangan TEXT NOT NULL DEFAULT ''
);

