-- 1. Revert catalog options
DELETE FROM gardening.aktivitas 
WHERE nama_jenis_aktivitas = 'Pemupukan' 
  AND Lahan_id_lahan IS NULL;

INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas) 
VALUES 
    ('Pemupukan', 'Pemupukan Organik'),
    ('Pemupukan', 'Pemupukan Anorganik');

-- 2. Revert records in gardening.perawatan
UPDATE gardening.perawatan 
SET nama_rincian_aktivitas = 'Pemupukan Organik' 
WHERE nama_rincian_aktivitas IN ('Pupuk Organik Padat', 'Pupuk Organik Cair');

UPDATE gardening.perawatan 
SET nama_rincian_aktivitas = 'Pemupukan Anorganik' 
WHERE nama_rincian_aktivitas = 'Pupuk Kimia';

-- 3. Revert records in gardening.aktivitas
UPDATE gardening.aktivitas 
SET nama_rincian_aktivitas = 'Pemupukan Organik' 
WHERE nama_rincian_aktivitas IN ('Pupuk Organik Padat', 'Pupuk Organik Cair');

UPDATE gardening.aktivitas 
SET nama_rincian_aktivitas = 'Pemupukan Anorganik' 
WHERE nama_rincian_aktivitas = 'Pupuk Kimia';
