DELETE FROM gardening.aktivitas
WHERE nama_jenis_aktivitas IN ('Stok Obat', 'Stok Pupuk')
  AND Lahan_id_lahan IS NULL;
