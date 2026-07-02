CREATE TABLE IF NOT EXISTS gardening.aktivitas (
    id_aktivitas           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas   VARCHAR(100) NOT NULL,
    nama_rincian_aktivitas VARCHAR(100) NOT NULL,
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

-- Seed catalog jenis & rincian aktivitas kebun
-- Data seed aktual (lahan, pohon, dll.) ada di seeders/gardening_seeds.sql
INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
SELECT v.jenis, v.rincian
FROM (VALUES
    ('Panen', 'Panen Buah'),
    ('Pemangkasan', 'Pemangkasan Pemeliharaan'),
    ('Pembersihan', 'Penyiangan Gulma'),
    ('Pembersihan', 'Pembumbunan Tanah'),
    ('Pembersihan', 'Sanitasi Serasah & Ranting'),
    ('Pembuahan', 'Merangsang Pembungaan'),
    ('Pembuahan', 'Penjarangan Buah'),
    ('Pembuahan', 'Pembungkusan Buah'),
    ('Pemberian Obat', 'Insektisida'),
    ('Pemberian Obat', 'Fungisida'),
    ('Pemberian Obat', 'Pestisida'),
    ('Pemupukan', 'Pupuk Organik Cair'),
    ('Pemupukan', 'Pupuk Organik Padat'),
    ('Pemupukan', 'Pupuk Kimia'),
    ('Penanaman', 'Bibit Baru'),
    ('Penanaman', 'Penggantian Bibit'),
    ('Penyiraman', 'Siram Manual'),
    ('Penyiraman', 'Irigrasi Drip / Pipanisasi')
) AS v(jenis, rincian)
WHERE NOT EXISTS (
    SELECT 1 FROM gardening.aktivitas a 
    WHERE a.nama_jenis_aktivitas = v.jenis AND a.nama_rincian_aktivitas = v.rincian
);
