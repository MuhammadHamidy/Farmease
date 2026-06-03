CREATE SCHEMA IF NOT EXISTS gardening;

CREATE TABLE IF NOT EXISTS gardening.lahan (
    id_lahan SERIAL PRIMARY KEY,
    kode_lahan VARCHAR(50) UNIQUE NOT NULL,
    status_lahan INT NOT NULL DEFAULT 1,
    varietas VARCHAR(100) NOT NULL DEFAULT '',
    tanggal_tanam DATE NOT NULL DEFAULT CURRENT_DATE,
    fase_tanam VARCHAR(50) NOT NULL DEFAULT ''
);


