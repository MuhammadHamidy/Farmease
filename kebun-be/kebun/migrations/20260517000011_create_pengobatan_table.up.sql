CREATE TABLE IF NOT EXISTS gardening.pengobatan (
    id_pengobatan          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_obat              VARCHAR(100) NOT NULL DEFAULT '',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT '',
    bagian_pohon           gardening.bagian_pohon_enum NOT NULL DEFAULT 'Umum',
    deskripsi              TEXT NOT NULL DEFAULT '',
    detail_pohon           VARCHAR(100) NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
