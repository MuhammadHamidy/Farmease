-- Move data back to pengobatan
INSERT INTO gardening.pengobatan (
    id_pengobatan, nama_obat, dosis, satuan, bagian_pohon, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
)
SELECT 
    id_pemupukan, nama_pupuk, dosis, satuan, 'Umum'::gardening.bagian_pohon_enum, deskripsi, "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
FROM gardening.pemupukan;

DROP TABLE IF EXISTS gardening.pemupukan CASCADE;
