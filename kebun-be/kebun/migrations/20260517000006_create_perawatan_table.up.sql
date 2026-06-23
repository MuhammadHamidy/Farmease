-- Tabel perawatan — mencakup aktivitas:
-- Pembersihan, Penyiraman, Penanaman, Pembuahan, Pemberian Obat ke Pohon
-- (Pemupukan memiliki tabel sendiri: gardening.pemupukan)
CREATE TABLE IF NOT EXISTS gardening.perawatan (
    id_perawatan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Jenis bahan yang digunakan dalam perawatan
    jenis_bahan            gardening.jenis_bahan_enum NOT NULL DEFAULT 'umum',

    -- Fase pohon saat perawatan dilakukan
    fase_pohon             gardening.fase_pohon_enum  NOT NULL DEFAULT 'Vegetatif',

    -- Dosis & satuan (digunakan saat jenis_bahan = 'obat' atau 'pupuk' cair)
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50)   NOT NULL DEFAULT '',

    -- Bagian pohon yang dirawat
    bagian_pohon           gardening.bagian_pohon_enum NOT NULL DEFAULT 'Umum',

    -- Teknik perawatan yang digunakan
    teknik_perawatan       VARCHAR(100)  NOT NULL DEFAULT '',

    -- Detail tambahan pohon (kondisi, ukuran, dll.)
    detail_pohon           VARCHAR(255)  NOT NULL DEFAULT '',

    -- Keterangan bebas / catatan
    deskripsi              TEXT          NOT NULL DEFAULT '',

    -- Referensi ke katalog obat (opsional, hanya jika menggunakan obat)
    JenisObat_id_jenis_obat UUID REFERENCES gardening.jenis_obat(id_jenis_obat) ON DELETE SET NULL,

    -- Relasi wajib ke lahan dan aktivitas
    Lahan_id_lahan         UUID NOT NULL REFERENCES gardening.lahan(id_lahan)     ON DELETE CASCADE,
    Aktivitas_id_aktivitas UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE
);
