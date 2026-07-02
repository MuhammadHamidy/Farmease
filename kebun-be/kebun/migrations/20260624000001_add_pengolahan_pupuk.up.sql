ALTER TYPE gardening.task_category_enum ADD VALUE IF NOT EXISTS 'pengolahan_pupuk';
ALTER TYPE gardening.task_rincian_enum ADD VALUE IF NOT EXISTS 'Pupuk Kandang';
ALTER TYPE gardening.task_rincian_enum ADD VALUE IF NOT EXISTS 'Pupuk Kompos';

INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
SELECT v.jenis, v.rincian
FROM (VALUES
    ('Pengolahan Pupuk', 'Pupuk Kandang'),
    ('Pengolahan Pupuk', 'Pupuk Kompos')
) AS v(jenis, rincian)
WHERE NOT EXISTS (
    SELECT 1 FROM gardening.aktivitas a 
    WHERE a.nama_jenis_aktivitas = v.jenis AND a.nama_rincian_aktivitas = v.rincian
);
