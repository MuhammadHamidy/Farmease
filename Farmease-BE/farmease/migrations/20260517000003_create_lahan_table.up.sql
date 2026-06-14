CREATE SCHEMA IF NOT EXISTS gardening;

CREATE TABLE IF NOT EXISTS gardening.lahan (
    id_lahan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_lahan VARCHAR(50) UNIQUE NOT NULL,
    nama_lahan VARCHAR(100) NOT NULL DEFAULT '',
    status_lahan INT NOT NULL DEFAULT 1,
    varietas VARCHAR(100) NOT NULL DEFAULT '',
    jenis_tanaman VARCHAR(100) NOT NULL DEFAULT '',
    luas_lahan NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    kapasitas_maksimal INT NOT NULL DEFAULT 0,
    tanggal_tanam DATE NOT NULL DEFAULT CURRENT_DATE,
    fase_tanam VARCHAR(50) NOT NULL DEFAULT ''
);


