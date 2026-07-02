CREATE TABLE IF NOT EXISTS gardening.penyiraman (
    id_penyiraman          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teknik_penyiraman      VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.pembersihan (
    id_pembersihan         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teknik_pembersihan      VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.penanaman (
    id_penanaman           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fase_pohon             gardening.fase_pohon_enum NOT NULL DEFAULT 'Vegetatif',
    varietas               VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.pengobatan (
    id_pengobatan          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_obat              VARCHAR(100) NOT NULL DEFAULT '',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT '',
    bagian_pohon           gardening.bagian_pohon_enum NOT NULL DEFAULT 'Umum',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gardening.pembuahan (
    id_pembuahan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fase_pohon             gardening.fase_pohon_enum NOT NULL DEFAULT 'Vegetatif',
    teknik_pembuahan       VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data from gardening.perawatan
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'gardening' AND tablename = 'perawatan') THEN
        -- 1. Penyiraman
        INSERT INTO gardening.penyiraman (id_penyiraman, teknik_penyiraman, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_perawatan, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.perawatan
        WHERE jenis_bahan = 'air' OR "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Penyiraman');

        -- 2. Pembersihan
        INSERT INTO gardening.pembersihan (id_pembersihan, teknik_pembersihan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_perawatan, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.perawatan
        WHERE jenis_bahan = 'pembersihan' OR "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pembersihan');

        -- 3. Penanaman
        INSERT INTO gardening.penanaman (id_penanaman, fase_pohon, varietas, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_perawatan, fase_pohon, detail_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.perawatan
        WHERE jenis_bahan = 'bibit' OR "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Penanaman');

        -- 4. Pengobatan (termasuk Pemupukan)
        INSERT INTO gardening.pengobatan (id_pengobatan, nama_obat, dosis, satuan, bagian_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_perawatan, nama_obat, dosis, satuan, bagian_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.perawatan
        WHERE jenis_bahan = 'obat' OR jenis_bahan = 'pupuk' OR "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pemberian Obat' OR nama_jenis_aktivitas = 'Pemupukan');

        -- 5. Pembuahan
        INSERT INTO gardening.pembuahan (id_pembuahan, fase_pohon, teknik_pembuahan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at)
        SELECT id_perawatan, fase_pohon, teknik_perawatan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
        FROM gardening.perawatan
        WHERE jenis_bahan = 'hormon' OR jenis_bahan = 'umum' OR "Aktivitas_id_aktivitas" IN (SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pembuahan');

        -- Drop old perawatan table
        DROP TABLE IF EXISTS gardening.perawatan CASCADE;
    END IF;
END $$;
