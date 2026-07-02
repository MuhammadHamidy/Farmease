ALTER TYPE gardening.task_rincian_enum ADD VALUE IF NOT EXISTS 'Fermentasi Pupuk';
ALTER TYPE gardening.task_rincian_enum ADD VALUE IF NOT EXISTS 'Cek Fermentasi';

INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
SELECT v.jenis, v.rincian
FROM (VALUES
    ('Pengolahan Pupuk', 'Fermentasi Pupuk'),
    ('Pengolahan Pupuk', 'Cek Fermentasi')
) AS v(jenis, rincian)
WHERE NOT EXISTS (
    SELECT 1 FROM gardening.aktivitas a 
    WHERE a.nama_jenis_aktivitas = v.jenis AND a.nama_rincian_aktivitas = v.rincian
);
