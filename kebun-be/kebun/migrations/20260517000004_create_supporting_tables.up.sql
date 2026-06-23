-- ============================================================
-- Migration: Tabel pendukung/referensi yang harus ada
-- sebelum tabel perawatan dan pohon dibuat.
-- ============================================================

-- ── 1. Katalog Master Obat (Jenis_Obat) ──
CREATE TABLE IF NOT EXISTS gardening.jenis_obat (
    id_jenis_obat  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_obat      VARCHAR(150) NOT NULL DEFAULT '',
    -- Contoh: 'Decis 25 EC', 'Antracol 70 WP', 'Dithane M-45'
    jenis_obat     VARCHAR(100) NOT NULL DEFAULT 'pestisida',
    -- Nilai: 'insektisida', 'fungisida', 'pestisida', 'herbisida', 'lainnya'
    satuan         VARCHAR(30)  NOT NULL DEFAULT 'liter',
    -- Contoh: 'liter', 'kg', 'botol', 'sachet', 'ml', 'gram'
    deskripsi      TEXT         NOT NULL DEFAULT '',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Blok Lahan (pengelompokan pohon dalam baris/blok) ──
CREATE TABLE IF NOT EXISTS gardening.blok_lahan (
    id_blok        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_blok      VARCHAR(50)  UNIQUE NOT NULL,
    -- Contoh: 'BLK-A1', 'BLK-B2'
    deskripsi      TEXT         NOT NULL DEFAULT '',
    jumlah_baris   INT          NOT NULL DEFAULT 0,
    Lahan_id_lahan UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE
);
