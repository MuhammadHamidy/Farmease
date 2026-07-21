CREATE TABLE IF NOT EXISTS gardening.pemupukan (
    id_pemupukan           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_pupuk             VARCHAR(100) NOT NULL DEFAULT '',
    dosis                  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    satuan                 VARCHAR(50) NOT NULL DEFAULT '',
    deskripsi              TEXT NOT NULL DEFAULT '',
    manure_id              UUID,
    id_stok_pupuk          UUID REFERENCES gardening.stok_pupuk(id_stok_pupuk) ON DELETE SET NULL,
    "Lahan_id_lahan"       UUID NOT NULL REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    "Aktivitas_id_aktivitas" UUID NOT NULL REFERENCES gardening.aktivitas(id_aktivitas) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data: move pupuk data from gardening.pengobatan to gardening.pemupukan
INSERT INTO gardening.pemupukan (
    id_pemupukan, nama_pupuk, dosis, satuan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
)
SELECT 
    id_pengobatan, nama_obat, dosis, satuan, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
FROM gardening.pengobatan
WHERE "Aktivitas_id_aktivitas" IN (
    SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pemupukan'
);

-- Remove migrated data from gardening.pengobatan
DELETE FROM gardening.pengobatan
WHERE "Aktivitas_id_aktivitas" IN (
    SELECT id_aktivitas FROM gardening.aktivitas WHERE nama_jenis_aktivitas = 'Pemupukan'
);
