-- Comprehensive seeder data for farmease_kebun database

-- Clean up existing tables to prevent unique constraint conflicts and ensure a clean state
DELETE FROM gardening.notifications;
DELETE FROM gardening.pencatatan_submissions;
DELETE FROM gardening.tasks;
DELETE FROM gardening.routine_schedules;
DELETE FROM gardening.panen;
DELETE FROM gardening.pemangkasan;
DELETE FROM gardening.perawatan;
DELETE FROM gardening.pohon;
DELETE FROM gardening.aktivitas;
DELETE FROM gardening.lahan;

-- 1. Seed Lahan (Perkebunan)
INSERT INTO gardening.lahan (id_lahan, kode_lahan, nama_lahan, jenis_tanaman, status_lahan, luas_lahan) VALUES
('11111111-1111-1111-1111-111111111111', 'L001', 'Lahan Alpukat', 'Alpukat', 1, 10.00),
('11111111-1111-1111-1111-111111111112', 'L002', 'Lahan Kelengkeng', 'Kelengkeng', 1, 12.00);

-- 2. Seed Pohon (Alpukat & Kelengkeng with all varieties and phases: Pembibitan, Vegetatif, Generatif, Panen, Tidak Produktif)
-- Alpukat (L001)
INSERT INTO gardening.pohon (id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, "Lahan_id_lahan") VALUES
('22222222-2222-2222-2222-222222220001', 'LA001', NOW() - INTERVAL '5 years', 'Alpukat Aligator', 'Generatif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220002', 'LA002', NOW() - INTERVAL '2 years', 'Alpukat Aligator', 'Vegetatif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220003', 'LA003', NOW() - INTERVAL '6 months', 'Alpukat Miki', 'Pembibitan', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220004', 'LA004', NOW() - INTERVAL '4 years', 'Alpukat Miki', 'Panen', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220005', 'LA005', NOW() - INTERVAL '10 years', 'Alpukat Markus', 'Tidak Produktif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220006', 'LA006', NOW() - INTERVAL '1.5 years', 'Alpukat Kelud', 'Vegetatif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220021', 'LA007', NOW() - INTERVAL '8 months', 'Alpukat Aligator', 'Pembibitan', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220022', 'LA008', NOW() - INTERVAL '12 years', 'Alpukat Miki', 'Tidak Produktif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220023', 'LA009', NOW() - INTERVAL '6 years', 'Alpukat Markus', 'Generatif', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222220024', 'LA010', NOW() - INTERVAL '7 years', 'Alpukat Kelud', 'Panen', '11111111-1111-1111-1111-111111111111');

-- Kelengkeng (L002)
INSERT INTO gardening.pohon (id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, "Lahan_id_lahan") VALUES
('22222222-2222-2222-2222-222222220007', 'LK001', NOW() - INTERVAL '5 years', 'Kelengkeng Itoh', 'Generatif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220008', 'LK002', NOW() - INTERVAL '2 years', 'Kelengkeng Itoh', 'Vegetatif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220009', 'LK003', NOW() - INTERVAL '6 months', 'Kelengkeng Pingpong', 'Pembibitan', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220010', 'LK004', NOW() - INTERVAL '4 years', 'Kelengkeng Pingpong', 'Panen', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220011', 'LK005', NOW() - INTERVAL '10 years', 'Kelengkeng Diamond', 'Tidak Produktif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220012', 'LK006', NOW() - INTERVAL '1.5 years', 'Kelengkeng Aroma Durian', 'Vegetatif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220031', 'LK007', NOW() - INTERVAL '8 months', 'Kelengkeng Itoh', 'Pembibitan', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220032', 'LK008', NOW() - INTERVAL '12 years', 'Kelengkeng Pingpong', 'Tidak Produktif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220033', 'LK009', NOW() - INTERVAL '6 years', 'Kelengkeng Diamond', 'Generatif', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222220034', 'LK010', NOW() - INTERVAL '7 years', 'Kelengkeng Aroma Durian', 'Panen', '11111111-1111-1111-1111-111111111112');

-- Seed catalog jenis & rincian aktivitas kebun
INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas) VALUES
('Panen', 'Panen Buah'),
('Pemangkasan', 'Pemangkasan Pemeliharaan'),
('Pembersihan', 'Penyiangan Gulma'),
('Pembersihan', 'Pembumbunan Tanah'),
('Pembersihan', 'Sanitasi Serasah & Ranting'),
('Pembuahan', 'Merangsang Pembungaan'),
('Pembuahan', 'Penjarangan Buah'),
('Pembuahan', 'Pembungkusan Buah'),
('Pemberian Obat', 'Insektisida'),
('Pemberian Obat', 'Fungisida'),
('Pemberian Obat', 'Pestisida'),
('Pengolahan Pupuk', 'Cek Fermentasi'),
('Pengolahan Pupuk', 'Fermentasi'),
('Pemupukan', 'Pupuk Organik Cair'),
('Pemupukan', 'Pupuk Organik Padat'),
('Pemupukan', 'Pupuk Kimia'),
('Penanaman', 'Bibit Baru'),
('Penanaman', 'Penggantian Bibit'),
('Penyiraman', 'Siram Manual'),
('Penyiraman', 'Irigrasi Drip / Pipanisasi'),
('Stok Obat', 'Tambah Stok Obat Baru'),
('Stok Obat', 'Tambah Stok Obat (Exp Lama)'),
('Stok Pupuk', 'PendaftaranPupuk/Bahan Baru'),
('Stok pupuk', 'Tambah Stok Pupuk (Exp Lama)'),
('Stok pupuk', 'Tambah Stok Bahan')

ON CONFLICT DO NOTHING;

-- 3. Seed Aktivitas & Hasil Panen (Historical 6-month data for graphs)
-- January 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000101', '2026-01-15 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000102', '2026-01-15 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000101', 3.00, 'kg', 'Panen perdana awal tahun', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000101'),
('b0000000-0000-0000-0000-000000000102', 2.00, 'kg', 'Panen kelengkeng muda', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000102');

-- February 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000201', '2026-02-15 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000202', '2026-02-15 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000201', 6.00, 'kg', 'Panen Februari', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000201'),
('b0000000-0000-0000-0000-000000000202', 5.00, 'kg', 'Panen Februari', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000202');

-- March 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000301', '2026-03-15 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000302', '2026-03-15 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000301', 15.00, 'kg', 'Panen Maret', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000301'),
('b0000000-0000-0000-0000-000000000302', 12.00, 'kg', 'Panen Maret', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000302');

-- April 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000401', '2026-04-15 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000402', '2026-04-15 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000401', 22.00, 'kg', 'Panen April', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000401'),
('b0000000-0000-0000-0000-000000000402', 18.00, 'kg', 'Panen April', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000402');

-- May 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000501', '2026-05-15 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000502', '2026-05-15 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000501', 37.00, 'kg', 'Panen Mei', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000501'),
('b0000000-0000-0000-0000-000000000502', 30.00, 'kg', 'Panen Mei', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000502');

-- June 2026
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a0000000-0000-0000-0000-000000000601', '2026-06-25 08:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000602', '2026-06-25 09:00:00+00', 'Panen', 'Panen Buah', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.panen (id_panen, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('b0000000-0000-0000-0000-000000000601', 1220.00, 'kg', 'Panen Raya Alpukat', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000601'),
('b0000000-0000-0000-0000-000000000602', 1220.00, 'kg', 'Panen Raya Kelengkeng', '11111111-1111-1111-1111-111111111112', 'a0000000-0000-0000-0000-000000000602');


-- 4. Seed Perawatan (Routine activities: Penyiraman, Pemberian Obat)
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a1111111-1111-1111-1111-111111110001', NOW() - INTERVAL '3 hours', 'Penyiraman', 'Siram Manual', '11111111-1111-1111-1111-111111111111'),
('a1111111-1111-1111-1111-111111110002', NOW() - INTERVAL '2 hours', 'Pemberian Obat', 'Fungisida', '11111111-1111-1111-1111-111111111111'),
('a1111111-1111-1111-1111-111111110003', NOW() - INTERVAL '3 hours', 'Penyiraman', 'Siram Manual', '11111111-1111-1111-1111-111111111112'),
('a1111111-1111-1111-1111-111111110004', NOW() - INTERVAL '2 hours', 'Pemberian Obat', 'Fungisida', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.perawatan (id_perawatan, jenis_bahan, fase_pohon, dosis, satuan, bagian_pohon, teknik_perawatan, detail_pohon, deskripsi, nama_obat, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('e0000000-0000-0000-0000-000000000001', 'air', 'Vegetatif', 10.00, 'Liter', 'Tanah', 'Penyiraman Melingkar', 'Kondisi lembap baik', 'Penyiraman pagi hari', '', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111110001'),
('e0000000-0000-0000-0000-000000000002', 'obat', 'Generatif', 50.00, 'ml', 'Daun', 'Penyemprotan', 'Gejala jamur daun', 'Aplikasi fungisida Mankozeb', 'Mankozeb', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111110002'),
('e0000000-0000-0000-0000-000000000003', 'air', 'Vegetatif', 12.00, 'Liter', 'Tanah', 'Penyiraman Melingkar', 'Kondisi lembap baik', 'Penyiraman pagi hari', '', '11111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111110003'),
('e0000000-0000-0000-0000-000000000004', 'obat', 'Generatif', 60.00, 'ml', 'Daun', 'Penyemprotan', 'Gejala jamur daun', 'Aplikasi fungisida Mankozeb', 'Mankozeb', '11111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111110004');


-- 5. Seed Pemangkasan (Pruning)
INSERT INTO gardening.aktivitas (id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES
('a2222222-2222-2222-2222-222222220001', NOW() - INTERVAL '1 days', 'Pemangkasan', 'Pemangkasan Pemeliharaan', '11111111-1111-1111-1111-111111111111'),
('a2222222-2222-2222-2222-222222220002', NOW() - INTERVAL '1 days', 'Pemangkasan', 'Pemangkasan Pemeliharaan', '11111111-1111-1111-1111-111111111112');

INSERT INTO gardening.pemangkasan (id_pemangkasan, jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas) VALUES
('c0000000-0000-0000-0000-000000000001', 5.50, 'kg', 'Pemotongan ranting kering dan air', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222220001'),
('c0000000-0000-0000-0000-000000000002', 6.00, 'kg', 'Pemangkasan cabang sakit', '11111111-1111-1111-1111-111111111112', 'a2222222-2222-2222-2222-222222220002');


-- 6. Seed Routine Schedules (jadwal_rutin)
INSERT INTO gardening.routine_schedules (id, title, description, category, frequency, days_of_week, start_date, priority, id_cage, id_account, rincian, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'Penyiraman Rutin Lahan Alpukat', 'Penyiraman rutin pagi hari', 'penyiraman', 'harian', '{1,2,3,4,5,6,7}', '2026-06-01', 'tinggi', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111105', 'Penyiraman Rutin', true),
('d0000000-0000-0000-0000-000000000002', 'Pemupukan Bulanan Lahan Alpukat', 'Pemberian pupuk organik padat', 'pemupukan', 'bulanan', NULL, '2026-06-01', 'sedang', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111105', 'Pupuk Padat', true),
('d0000000-0000-0000-0000-000000000003', 'Penyiraman Rutin Lahan Kelengkeng', 'Penyiraman rutin pagi hari', 'penyiraman', 'harian', '{1,2,3,4,5,6,7}', '2026-06-01', 'tinggi', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111105', 'Penyiraman Rutin', true);


-- 7. Seed Tasks
INSERT INTO gardening.tasks (id_task, title, description, task_date, status, priority, id_account, category, end_time, schedule_id, id_cage, start_time, rincian) VALUES
('e0000000-0000-0000-0000-000000000101', 'Penyiraman Rutin Lahan Alpukat', 'Siram secukupnya pagi ini', NOW() - INTERVAL '1 hours', 'selesai', 'tinggi', '11111111-1111-1111-1111-111111111105', 'penyiraman', '', 'd0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '08:00:00', 'Penyiraman Rutin'),
('e0000000-0000-0000-0000-000000000102', 'Penyiraman Rutin Lahan Kelengkeng', 'Siram secukupnya pagi ini', NOW() - INTERVAL '1 hours', 'pending', 'tinggi', '11111111-1111-1111-1111-111111111105', 'penyiraman', '', 'd0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111112', '08:00:00', 'Penyiraman Rutin'),
('e0000000-0000-0000-0000-000000000103', 'Pemupukan Bulanan Lahan Alpukat', 'Tebarkan pupuk kandang di sekitar tajuk', NOW() + INTERVAL '1 days', 'pending', 'sedang', '11111111-1111-1111-1111-111111111105', 'pemupukan', '', 'd0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '10:00:00', 'Pupuk Padat');


-- 8. Seed Pencatatan Submissions (Approved and Pending)
INSERT INTO gardening.pencatatan_submissions (id, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, approval_status, submitted_at) VALUES
('sub-pembersihan-001', 'pembersihan', 'Pembersihan', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Pembersihan Gulma & Sanitasi', '{"data": {"items": [{"beratGulma": "15.0", "jenisGulma": "Rumput Liar", "alatPembersihan": "Sabit"}]}}'::jsonb, 'approved', NOW() - INTERVAL '3 days'),
('sub-pembersihan-002', 'pembersihan', 'Pembersihan', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Pembersihan Gulma & Sanitasi', '{"data": {"items": [{"beratGulma": "10.0", "jenisGulma": "Alang-alang", "alatPembersihan": "Cangkul"}]}}'::jsonb, 'approved', NOW() - INTERVAL '2 days'),
('sub-pupuk-001', 'pemupukan', 'Pemupukan', 'PK001', 'Operator Kebun', 'L001', 'pohon', 'Mencatat Pemupukan NPK', '{"data": {"items": [{"jenisPupukDetail": "NPK", "jumlahBeratPupuk": "5", "satuanVolumeObat": "Kilogram (Kg)", "deskripsiPemupukan": "Pemupukan bulanan"}]}}'::jsonb, 'approved', NOW() - INTERVAL '10 days'),
('sub-obat-001', 'pemberian obat', 'Pemberian Obat', 'PK001', 'Operator Kebun', 'L001', 'pohon', 'Mencatat Pemberian Insektisida', '{"data": {"items": [{"namaObat": "Sipermetrin 50EC", "dosisObat": "100", "satuanVolumeObat": "Mililiter (ml)", "deskripsiPerawatan": "Semprot hama ulat"}]}}'::jsonb, 'approved', NOW() - INTERVAL '8 days'),
('sub-panen-001', 'panen', 'Panen', 'PK001', 'Operator Kebun', 'L002', 'pohon', 'Mencatat Panen Kelengkeng', '{"data": {"items": [{"jumlahPanen": "50", "unit": "kg", "deskripsiPanen": "Panen kelengkeng manis"}]}}'::jsonb, 'pending', NOW() - INTERVAL '1 hours'),
('sub-stok-pupuk-001', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Pupuk Baru (NPK)', '{"data": {"items": [{"namaObat": "NPK", "tipeStok": "baru", "jenisPupuk": "Pupuk Kimia", "volumeObat": "50", "satuanVolumeObat": "Kilogram (Kg)", "tujuanPemanfaatan": "pupuk", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days'),
('sub-stok-pupuk-002', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Pupuk Baru (Urea)', '{"data": {"items": [{"namaObat": "Urea", "tipeStok": "baru", "jenisPupuk": "Pupuk Kimia", "volumeObat": "30", "satuanVolumeObat": "Kilogram (Kg)", "tujuanPemanfaatan": "pupuk", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days'),
('sub-stok-pupuk-003', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Pupuk Baru (Pupuk Kandang)', '{"data": {"items": [{"namaObat": "Pupuk Kandang", "tipeStok": "baru", "jenisPupuk": "Pupuk Organik Padat", "volumeObat": "150", "satuanVolumeObat": "Kilogram (Kg)", "tujuanPemanfaatan": "pupuk", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days'),
('sub-stok-pupuk-004', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Pupuk Baru (POC Air Kelapa)', '{"data": {"items": [{"namaObat": "POC Air Kelapa", "tipeStok": "baru", "jenisPupuk": "Pupuk Organik Cair", "volumeObat": "1000", "satuanVolumeObat": "Mililiter (ml)", "tujuanPemanfaatan": "pupuk", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days'),
('sub-stok-bahan-001', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Bahan (EM4)', '{"data": {"items": [{"namaObat": "EM4", "tipeStok": "baru", "jenisPupuk": "Pupuk Organik Cair", "volumeObat": "5000", "satuanVolumeObat": "Mililiter (ml)", "tujuanPemanfaatan": "bahan", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days'),
('sub-stok-bahan-002', 'stok pupuk', 'Stok Pupuk', 'PK001', 'Operator Kebun', 'L001', 'lahan', 'Mencatat Stok Bahan (Tetes Tebu (Molase))', '{"data": {"items": [{"namaObat": "Tetes Tebu (Molase)", "tipeStok": "baru", "jenisPupuk": "Pupuk Organik Cair", "volumeObat": "3000", "satuanVolumeObat": "Mililiter (ml)", "tujuanPemanfaatan": "bahan", "tanggalKadaluarsa": "2027-12-31"}]}}'::jsonb, 'approved', NOW() - INTERVAL '4 days');


-- 9. Seed Notifications (notifikasi)
INSERT INTO gardening.notifications (id_notification, title, message, is_read, id_account, type, task_id, submission_id, created_at) VALUES
(gen_random_uuid(), 'Tugas Baru', 'Anda memiliki tugas Penyiraman Rutin Lahan Alpukat', false, '11111111-1111-1111-1111-111111111105', 'task', 'e0000000-0000-0000-0000-000000000101', NULL, NOW() - INTERVAL '10 minutes'),
(gen_random_uuid(), 'Persetujuan Pencatatan', 'Pencatatan Pemupukan NPK disetujui oleh Admin', false, '11111111-1111-1111-1111-111111111105', 'submission', NULL, 'sub-pupuk-001', NOW() - INTERVAL '5 minutes');
