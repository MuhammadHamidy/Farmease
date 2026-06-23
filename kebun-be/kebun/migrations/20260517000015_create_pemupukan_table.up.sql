-- Tabel pemupukan — tabel terpisah untuk pencatatan pemupukan
-- Mencakup: aplikasi pupuk ke pohon/blok lahan
-- Integrasi: sumber pupuk bisa dari limbah ternak (circular ecosystem)
CREATE TABLE IF NOT EXISTS gardening.pemupukan (
    id_pemupukan           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Jenis & nama pupuk yang digunakan
    nama_pupuk             VARCHAR(150) NOT NULL DEFAULT '',
    -- Contoh: 'Kohe Domba Fermentasi', 'NPK Mutiara', 'Kompos Mandiri'

    jenis_pupuk            VARCHAR(100) NOT NULL DEFAULT 'organik',
    -- Nilai: 'organik', 'anorganik', 'hayati', 'cair', 'lainnya'

    -- Dosis aplikasi
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(30)   NOT NULL DEFAULT 'kg',
    -- Contoh: 'kg', 'liter', 'gram', 'karung'

    -- Keterangan tambahan (teknik, waktu, kondisi)
    deskripsi              TEXT          NOT NULL DEFAULT '',

    -- Integrasi ekosistem ternak → kebun
    -- Diisi jika sumber pupuk berasal dari produksi kohe/kompos ternak
    ref_ternak_submission_id VARCHAR(100) DEFAULT NULL,
    -- Menyimpan ID produksi kohe dari modul peternakan

    -- Relasi ke blok lahan (pemupukan dilakukan per blok)
    BlokLahan_id_blok      UUID REFERENCES gardening.blok_lahan(id_blok) ON DELETE SET NULL,

    -- Relasi ke aktivitas (tanggal & rincian aktivitas)
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);

-- Index pencarian cepat
CREATE INDEX IF NOT EXISTS idx_pemupukan_jenis  ON gardening.pemupukan(jenis_pupuk);
CREATE INDEX IF NOT EXISTS idx_pemupukan_blok   ON gardening.pemupukan(BlokLahan_id_blok);
