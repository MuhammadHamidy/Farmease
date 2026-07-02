DELETE FROM gardening.aktivitas 
WHERE nama_jenis_aktivitas = 'Pengolahan Pupuk' 
  AND nama_rincian_aktivitas IN ('Pupuk Kandang', 'Pupuk Kompos');
