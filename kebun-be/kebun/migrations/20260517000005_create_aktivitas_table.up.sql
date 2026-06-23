CREATE TABLE IF NOT EXISTS gardening.aktivitas (
    id_aktivitas           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_aktivitas      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nama_jenis_aktivitas   VARCHAR(100) NOT NULL,
    nama_rincian_aktivitas VARCHAR(100) NOT NULL,
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);

-- Seed initial catalog data into gardening.aktivitas
-- Catatan: Stok Pupuk dan Stok Obat TIDAK disimpan di sini karena
-- memiliki tabel dedikasi masing-masing:
--   - gardening.stok_pupuk (migrasi 20260517000015)
--   - gardening.stok_obat  (migrasi 20260517000016)
INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
SELECT v.jenis, v.rincian
FROM (VALUES
    ('Panen', 'Panen Buah'),
    ('Pemangkasan', 'Pemangkasan Ranting'),
    ('Pemangkasan', 'Pemangkasan Bentuk'),
    ('Pemangkasan', 'Pemangkasan Peremajaan'),
    ('Pembersihan', 'Penyiangan Gulma'),
    ('Pembersihan', 'Pembumbunan Tanah'),
    ('Pembersihan', 'Sanitasi Serasah & Ranting'),
    ('Pembuahan', 'Merangsang Pembungaan'),
    ('Pembuahan', 'Penjarangan Buah'),
    ('Pembuahan', 'Pembungkusan Buah'),
    ('Pemberian Obat', 'Insektisida'),
    ('Pemberian Obat', 'Fungisida'),
    ('Pemberian Obat', 'Pestisida'),
    ('Pemupukan', 'Pemupukan Organik'),
    ('Pemupukan', 'Pemupukan Anorganik'),
    ('Penanaman', 'Bibit Baru'),
    ('Penanaman', 'Penggantian Bibit'),
    ('Penyiraman', 'Siram Manual'),
    ('Penyiraman', 'Irigrasi Drip / Pipanisasi'),
    ('Penyiraman', 'Biopori')
) AS v(jenis, rincian)
WHERE NOT EXISTS (
    SELECT 1 FROM gardening.aktivitas a 
    WHERE a.nama_jenis_aktivitas = v.jenis AND a.nama_rincian_aktivitas = v.rincian
);
