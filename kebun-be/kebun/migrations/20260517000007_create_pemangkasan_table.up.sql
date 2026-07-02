-- Tabel pemangkasan — mencatat aktivitas pemangkasan pohon
-- Jenis: Pemangkasan Ranting, Pemangkasan Bentuk, Pemangkasan Peremajaan
-- Tabel pemangkasan — mencatat aktivitas pemangkasan pohon
-- Jenis: Pemangkasan Ranting, Pemangkasan Bentuk, Pemangkasan Peremajaan
CREATE TABLE IF NOT EXISTS gardening.pemangkasan (
    id_pemangkasan         UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Hasil pemangkasan (berat/volume ranting yang dipotong)
    jumlah                 NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50)   NOT NULL DEFAULT 'kg',
    -- Contoh: 'kg', 'ikat', 'batang'

    -- Kondisi/ketersediaan pohon setelah pemangkasan
    kesediaan              VARCHAR(100)  NOT NULL DEFAULT '',
    -- Contoh: 'Produktif', 'Perlu Pemulihan', 'Baik'

    -- Keterangan tambahan
    keterangan             TEXT          NOT NULL DEFAULT '',

    -- Relasi ke lahan dan aktivitas
    Lahan_id_lahan         UUID REFERENCES gardening.lahan(id_lahan)         ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);
