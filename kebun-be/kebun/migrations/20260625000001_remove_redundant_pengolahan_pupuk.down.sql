INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
VALUES 
    ('Pengolahan Pupuk', 'Pupuk Kandang'),
    ('Pengolahan Pupuk', 'Pupuk Kompos')
ON CONFLICT DO NOTHING;
