CREATE TABLE IF NOT EXISTS gardening.pembersihan (
    id_pembersihan         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teknik_pembersihan      VARCHAR(100) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
