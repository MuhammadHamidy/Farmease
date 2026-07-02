CREATE TABLE IF NOT EXISTS gardening.perawatan (
    id_perawatan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis_bahan            gardening.jenis_bahan_enum NOT NULL DEFAULT 'umum',
    fase_pohon             gardening.fase_pohon_enum  NOT NULL DEFAULT 'Vegetatif',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50)   NOT NULL DEFAULT '',
    bagian_pohon           gardening.bagian_pohon_enum NOT NULL DEFAULT 'Umum',
    teknik_perawatan       VARCHAR(100)  NOT NULL DEFAULT '',
    detail_pohon           VARCHAR(255)  NOT NULL DEFAULT '',
    deskripsi              TEXT          NOT NULL DEFAULT '',
    nama_obat              VARCHAR(100)  NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan)     ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data back to gardening.perawatan
DO $$
BEGIN
    -- 1. Penyiraman
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'penyiraman') THEN
        INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_penyiraman, 'air'::gardening.jenis_bahan_enum, 'Vegetatif'::gardening.fase_pohon_enum, teknik_penyiraman, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.penyiraman;
    END IF;

    -- 2. Pembersihan
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'pembersihan') THEN
        INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_pembersihan, 'pembersihan'::gardening.jenis_bahan_enum, 'Vegetatif'::gardening.fase_pohon_enum, teknik_pembersihan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.pembersihan;
    END IF;

    -- 3. Penanaman
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'penanaman') THEN
        INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, detail_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_penanaman, 'bibit'::gardening.jenis_bahan_enum, fase_pohon, varietas, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.penanaman;
    END IF;

    -- 4. Pengobatan
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'pengobatan') THEN
        INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, nama_obat, dosis, satuan, bagian_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_pengobatan, 
               CASE WHEN "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pemupukan') THEN 'pupuk'::gardening.jenis_bahan_enum ELSE 'obat'::gardening.jenis_bahan_enum END,
               'Vegetatif'::gardening.fase_pohon_enum, nama_obat, dosis, satuan, bagian_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.pengobatan;
    END IF;

    -- 5. Pembuahan
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'pembuahan') THEN
        INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_pembuahan, 'hormon'::gardening.jenis_bahan_enum, fase_pohon, teknik_pembuahan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.pembuahan;
    END IF;
END $$;

DROP TABLE IF EXISTS gardening.penyiraman CASCADE;
DROP TABLE IF EXISTS gardening.pembersihan CASCADE;
DROP TABLE IF EXISTS gardening.penanaman CASCADE;
DROP TABLE IF EXISTS gardening.pengobatan CASCADE;
DROP TABLE IF EXISTS gardening.pembuahan CASCADE;
