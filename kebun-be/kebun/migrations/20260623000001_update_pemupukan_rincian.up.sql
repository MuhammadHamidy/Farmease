-- 1. Update existing activities in gardening.aktivitas
UPDATE gardening.aktivitas 
SET nama_rincian_aktivitas = 'Pupuk Organik Padat' 
WHERE nama_rincian_aktivitas = 'Pemupukan Organik';

UPDATE gardening.aktivitas 
SET nama_rincian_aktivitas = 'Pupuk Kimia' 
WHERE nama_rincian_aktivitas = 'Pemupukan Anorganik';

-- 2. Update existing activities in gardening.perawatan
UPDATE gardening.perawatan 
SET nama_rincian_aktivitas = 'Pupuk Organik Padat' 
WHERE nama_rincian_aktivitas = 'Pemupukan Organik';

UPDATE gardening.perawatan 
SET nama_rincian_aktivitas = 'Pupuk Kimia' 
WHERE nama_rincian_aktivitas = 'Pemupukan Anorganik';

-- 3. Update catalog options (rows with Lahan_id_lahan IS NULL)
DELETE FROM gardening.aktivitas 
WHERE nama_jenis_aktivitas = 'Pemupukan' 
  AND Lahan_id_lahan IS NULL;

INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas) 
VALUES 
    ('Pemupukan', 'Pupuk Organik Cair'),
    ('Pemupukan', 'Pupuk Organik Padat'),
    ('Pemupukan', 'Pupuk Kimia');
