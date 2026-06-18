CREATE TABLE IF NOT EXISTS gardening.pencatatan_jenis (
    id_jenis    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama        VARCHAR(100) NOT NULL UNIQUE,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.pencatatan_rincian (
    id_rincian  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis_id    UUID NOT NULL REFERENCES gardening.pencatatan_jenis(id_jenis) ON DELETE CASCADE,
    nama        VARCHAR(100) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jenis_id, nama)
);

CREATE INDEX IF NOT EXISTS idx_pencatatan_rincian_jenis ON gardening.pencatatan_rincian(jenis_id);

INSERT INTO gardening.pencatatan_jenis (nama, sort_order) VALUES
    ('Panen', 1),
    ('Pemangkasan', 2),
    ('Pembersihan', 3),
    ('Pembuahan', 4),
    ('Pemberian Obat', 5),
    ('Pemupukan', 6),
    ('Penanaman', 7),
    ('Penyiraman', 8),
    ('Stok Obat', 9),
    ('Stok Pupuk', 10)
ON CONFLICT (nama) DO NOTHING;

INSERT INTO gardening.pencatatan_rincian (jenis_id, nama, sort_order)
SELECT j.id_jenis, r.nama, r.sort_order
FROM gardening.pencatatan_jenis j
JOIN (VALUES
    ('Panen', 'Panen Buah', 1),
    ('Pemangkasan', 'Pemangkasan Ranting', 1),
    ('Pemangkasan', 'Pemangkasan Bentuk', 2),
    ('Pemangkasan', 'Pemangkasan Peremajaan', 3),
    ('Pembersihan', 'Penyiangan Gulma', 1),
    ('Pembersihan', 'Pembumbunan Tanah', 2),
    ('Pembersihan', 'Sanitasi Serasah & Ranting', 3),
    ('Pembuahan', 'Merangsang Pembungaan', 1),
    ('Pembuahan', 'Penjarangan Buah', 2),
    ('Pembuahan', 'Pembungkusan Buah', 3),
    ('Pemberian Obat', 'Insektisida', 1),
    ('Pemberian Obat', 'Fungisida', 2),
    ('Pemberian Obat', 'Pestisida', 3),
    ('Pemupukan', 'Pemupukan Organik', 1),
    ('Pemupukan', 'Pemupukan Anorganik', 2),
    ('Penanaman', 'Bibit Baru', 1),
    ('Penanaman', 'Penggantian Bibit', 2),
    ('Penyiraman', 'Siram Manual', 1),
    ('Penyiraman', 'Irigrasi Drip / Pipanisasi', 2),
    ('Penyiraman', 'Biopori', 3),
    ('Stok Obat', 'Tambah Obat', 1),
    ('Stok Pupuk', 'Stok Masuk', 1),
    ('Stok Pupuk', 'Stok Keluar', 2)
) AS r(jenis_nama, nama, sort_order) ON j.nama = r.jenis_nama
ON CONFLICT (jenis_id, nama) DO NOTHING;
