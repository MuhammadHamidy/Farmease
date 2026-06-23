DELETE FROM gardening.aktivitas 
WHERE nama_jenis_aktivitas = 'Pemangkasan' 
  AND Lahan_id_lahan IS NULL;

INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas) 
VALUES ('Pemangkasan', 'Pemangkasan Pemeliharaan');
