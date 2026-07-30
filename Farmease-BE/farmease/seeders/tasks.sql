-- ============================================================================
-- SEEDER: module/tasks + module/routine_schedules
-- UUID valid hex: da=routine_schedules, db=tasks
-- ============================================================================

-- ============================
-- ROUTINE SCHEDULES
-- ============================
INSERT INTO operations.routine_schedules (
    id, title, description, category, frequency,
    days_of_week, start_date, start_time, end_time,
    priority, id_cage, id_account, rincian, is_active
) VALUES

-- Pakan Pagi - Kandang Anakan (Setiap Hari)
(
    'da000001-0000-0000-0000-000000000001',
    'Pakan Pagi Kandang Anakan',
    'Pemberian pakan pagi rutin untuk semua domba di kandang anakan. Hijauan (Odot/Rumput Gajah) + Konsentrat (Bekatul).',
    'pakan', 'harian',
    NULL, '2026-01-01', '06:30', '07:30',
    'tinggi', '33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111106',
    'Pakan Pagi', true
),
-- Pakan Sore - Kandang Anakan (Setiap Hari)
(
    'da000001-0000-0000-0000-000000000002',
    'Pakan Sore Kandang Anakan',
    'Pemberian pakan sore rutin untuk semua domba di kandang anakan. Pakan silase / hijauan segar.',
    'pakan', 'harian',
    NULL, '2026-01-01', '15:30', '16:30',
    'tinggi', '33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111106',
    'Pakan Sore', true
),
-- Pakan Pagi - Kandang Indukan (Setiap Hari)
(
    'da000002-0000-0000-0000-000000000001',
    'Pakan Pagi Kandang Indukan',
    'Pemberian pakan pagi untuk semua domba betina (indukan). Pellet indukan + Rumput Gajah.',
    'pakan', 'harian',
    NULL, '2026-01-01', '06:00', '07:00',
    'tinggi', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111106',
    'Pakan Pagi', true
),
-- Pakan Sore - Kandang Indukan (Setiap Hari)
(
    'da000002-0000-0000-0000-000000000002',
    'Pakan Sore Kandang Indukan',
    'Pemberian pakan sore untuk semua domba betina (indukan). Hijauan segar + Konsentrat protein.',
    'pakan', 'harian',
    NULL, '2026-01-01', '15:00', '16:00',
    'tinggi', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111106',
    'Pakan Sore', true
),
-- Pakan Pejantan Baterai (Setiap Hari)
(
    'da000003-0000-0000-0000-000000000001',
    'Pakan Harian Kandang Baterai 1 (D177)',
    'Pemberian pakan harian untuk D177/Toni. Pellet performa + Rumput Gajah.',
    'pakan', 'harian',
    NULL, '2026-01-01', '07:00', '07:30',
    'sedang', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111106',
    'Pakan Pagi', true
),
(
    'da000003-0000-0000-0000-000000000002',
    'Pakan Harian Kandang Baterai 2 (XD010)',
    'Pemberian pakan harian untuk XD010/Goliath. Pellet performa + Rumput.',
    'pakan', 'harian',
    NULL, '2026-01-01', '07:00', '07:30',
    'sedang', '33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111106',
    'Pakan Pagi', true
),
(
    'da000003-0000-0000-0000-000000000003',
    'Pakan Harian Kandang Baterai 3 (J-01)',
    'Pemberian pakan harian untuk J-01. Pellet performa + Rumput.',
    'pakan', 'harian',
    NULL, '2026-01-01', '07:00', '07:30',
    'sedang', '33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111106',
    'Pakan Pagi', true
),
-- Pembersihan Kandang - Mingguan
(
    'da000004-0000-0000-0000-000000000001',
    'Pembersihan Kandang Anakan',
    'Pembersihan total kandang anakan: buang kotoran, semprot disinfektan, ganti alas kandang.',
    'pakan', 'mingguan',
    ARRAY[1], '2026-01-01', '08:00', '10:00',
    'sedang', '33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111106',
    'Pembersihan Kandang', true
),
(
    'da000004-0000-0000-0000-000000000002',
    'Pembersihan Kandang Indukan',
    'Pembersihan total kandang indukan: buang kotoran, semprot disinfektan.',
    'pakan', 'mingguan',
    ARRAY[1], '2026-01-01', '10:00', '12:00',
    'sedang', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111106',
    'Pembersihan Kandang', true
),
-- Pengumpulan Kotoran - Bulanan
(
    'da000005-0000-0000-0000-000000000001',
    'Pengumpulan Kotoran Kandang',
    'Pengumpulan dan penampungan kotoran dari semua kandang untuk diolah menjadi pupuk organik.',
    'kotoran', 'bulanan',
    NULL, '2026-01-01', '08:00', '11:00',
    'sedang', NULL, '11111111-1111-1111-1111-111111111106',
    NULL, true
),
-- Penimbangan Rutin - Bulanan
(
    'da000006-0000-0000-0000-000000000001',
    'Penimbangan Rutin Semua Domba',
    'Penimbangan berat badan rutin semua domba aktif untuk memantau pertumbuhan (ADG).',
    'weighing', 'bulanan',
    NULL, '2026-01-01', '08:00', '12:00',
    'sedang', NULL, '11111111-1111-1111-1111-111111111106',
    NULL, true
),
-- Kontrol Kebuntingan - Mingguan untuk indukan hamil
(
    'da000007-0000-0000-0000-000000000001',
    'Kontrol Kebuntingan XG893 & B-01',
    'Pemantauan kondisi indukan bunting XG893 dan B-01 menjelang HPL.',
    'kesehatan', 'mingguan',
    ARRAY[1,4], '2026-06-01', '09:00', '10:00',
    'tinggi', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111106',
    'Kontrol Kebuntingan', true
)

ON CONFLICT DO NOTHING;


-- ============================
-- TASKS (Tugas Harian Operator)
-- ============================
INSERT INTO operations.tasks (
    id_task, title, description, task_date, status,
    priority, id_account, category, end_time,
    schedule_id, id_cage, start_time, rincian
) VALUES

-- Tugas Hari Ini
(
    'db000001-0000-0000-0000-000000000001',
    'Pakan Pagi Kandang Anakan',
    'Berikan pakan pagi: 2 kg Odot + 0.3 kg Bekatul per ekor.',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:30',
    'da000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333301',
    '06:30', 'Pakan Pagi'
),
(
    'db000001-0000-0000-0000-000000000002',
    'Pakan Pagi Kandang Indukan',
    'Berikan pakan pagi: 2.5 kg Rumput Gajah + 0.6 kg Pellet Indukan per ekor.',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:00',
    'da000002-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333302',
    '06:00', 'Pakan Pagi'
),
(
    'db000001-0000-0000-0000-000000000003',
    'Pakan Harian Kandang Baterai (D177, XD010, J-01)',
    'Berikan pakan untuk 3 pejantan di kandang baterai. Pellet + Rumput.',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum', 'sedang', '11111111-1111-1111-1111-111111111106', 'pakan', '07:30',
    NULL, NULL,
    '07:00', 'Pakan Pagi'
),
(
    'db000001-0000-0000-0000-000000000004',
    'Kontrol Harian XG893 (Mak Bocil) - H-4 HPL',
    'Monitor kondisi XG893 yang akan melahirkan dalam 4 hari. Cek tanda-tanda prelabor.',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'kelahiran', '09:00',
    NULL, '33333333-3333-3333-3333-333333333302',
    '08:30', 'Kontrol Kebuntingan'
),
(
    'db000001-0000-0000-0000-000000000005',
    'Kontrol Harian B-01 - H-5 HPL',
    'Monitor kondisi B-01 yang akan melahirkan dalam 5 hari. Siapkan perlengkapan persalinan.',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'kelahiran', '09:30',
    NULL, '33333333-3333-3333-3333-333333333302',
    '09:00', 'Kontrol Kebuntingan'
),

-- Tugas Kemarin (selesai)
(
    'db000002-0000-0000-0000-000000000001',
    'Pakan Pagi Kandang Anakan',
    'Pemberian pakan pagi rutin.',
    (CURRENT_DATE - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'selesai', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:30',
    'da000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333301',
    '06:30', 'Pakan Pagi'
),
(
    'db000002-0000-0000-0000-000000000002',
    'Pakan Pagi Kandang Indukan',
    'Pemberian pakan pagi rutin.',
    (CURRENT_DATE - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'selesai', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:00',
    'da000002-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333302',
    '06:00', 'Pakan Pagi'
),
(
    'db000002-0000-0000-0000-000000000003',
    'Pengumpulan Kotoran Semua Kandang',
    'Kumpulkan kotoran dari semua kandang.',
    (CURRENT_DATE - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'selesai', 'sedang', '11111111-1111-1111-1111-111111111106', 'kotoran', '11:00',
    'da000005-0000-0000-0000-000000000001', NULL,
    '08:00', NULL
),
(
    'db000002-0000-0000-0000-000000000004',
    'Penimbangan Rutin Domba',
    'Timbang semua domba aktif untuk pemantauan ADG.',
    (CURRENT_DATE - INTERVAL '4 day') AT TIME ZONE 'Asia/Jakarta',
    'selesai', 'sedang', '11111111-1111-1111-1111-111111111106', 'weighing', '12:00',
    'da000006-0000-0000-0000-000000000001', NULL,
    '08:00', NULL
),

-- Tugas Overdue / Terlambat
(
    'db000003-0000-0000-0000-000000000001',
    'Vaksinasi Rutin Kandang Anakan',
    'Vaksinasi Enterotoxemia dan Tetanus semua anak domba di kandang anakan.',
    (CURRENT_DATE - INTERVAL '3 day') AT TIME ZONE 'Asia/Jakarta',
    'terlambat', 'tinggi', '11111111-1111-1111-1111-111111111106', 'kesehatan', '12:00',
    NULL, '33333333-3333-3333-3333-333333333301',
    '09:00', 'Vaksinasi'
),

-- Tugas Mendatang
(
    'db000004-0000-0000-0000-000000000001',
    'Pakan Pagi Kandang Anakan',
    'Pemberian pakan pagi rutin.',
    (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:30',
    'da000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333301',
    '06:30', 'Pakan Pagi'
),
(
    'db000004-0000-0000-0000-000000000002',
    'Pakan Pagi Kandang Indukan',
    'Pemberian pakan pagi rutin.',
    (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'pakan', '07:00',
    'da000002-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333302',
    '06:00', 'Pakan Pagi'
),
(
    'db000004-0000-0000-0000-000000000003',
    'Persiapan Persalinan XG893 - H-3',
    'Siapkan kandang bersalin sementara, perlengkapan persalinan: handuk, yodium, tali, dll.',
    (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta',
    'belum', 'tinggi', '11111111-1111-1111-1111-111111111106', 'kelahiran', '11:00',
    NULL, '33333333-3333-3333-3333-333333333302',
    '09:00', 'Pemeriksaan Anak & Induk'
)

ON CONFLICT (id_task) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    task_date = EXCLUDED.task_date,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    category = EXCLUDED.category,
    end_time = EXCLUDED.end_time,
    start_time = EXCLUDED.start_time,
    rincian = EXCLUDED.rincian;


-- ============================================================================
-- SILASE CONVERSION & AUTOMATIC CHECKING TASK SEEDER (TC-08a & FR9-02)
-- ============================================================================

-- 1. Pastikan Pakan Silase Campuran terdaftar di logistics.feeds
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes)
VALUES ('ca000006-0000-0000-0000-000000000001', 'Pakan Silase Campuran', 'kg', 100.00, 0.00, 'hijauan', 'internal', 'Pakan silase hasil fermentasi mandiri')
ON CONFLICT (id_feed) DO NOTHING;

-- 2. Buat record Silage Conversion bertanggal 7 hari yang lalu
INSERT INTO logistics.silage_conversions (id_conversion, id_target_feed, conversion_date, target_amount, unit, notes)
VALUES ('aa000008-0000-0000-0000-000000000001', 'ca000006-0000-0000-0000-000000000001', (CURRENT_DATE - INTERVAL '7 days') AT TIME ZONE 'Asia/Jakarta', 100.00, 'kg', 'Konversi jerami padi dan bekatul untuk silase')
ON CONFLICT (id_conversion) DO NOTHING;

-- 3. Buat detail bahan penyusun konversi tersebut
INSERT INTO logistics.silage_conversion_details (id_detail, id_conversion, id_feed, amount) VALUES
('ab000008-0000-0000-0000-000000000001', 'aa000008-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 70.00),
('ab000008-0000-0000-0000-000000000002', 'aa000008-0000-0000-0000-000000000001', 'ca000002-0000-0000-0000-000000000001', 30.00)
ON CONFLICT (id_detail) DO NOTHING;

-- 4. Buat Tugas Pengecekan Evaluasi Fermentasi Silase (Hari ke-7)
INSERT INTO operations.tasks (
    id_task, title, description, task_date, status,
    priority, id_account, category, end_time,
    schedule_id, id_cage, start_time, rincian
) VALUES (
    'db000008-0000-0000-0000-000000000001',
    'Pengecekan Evaluasi Fermentasi Silase (Hari ke-7)',
    'Lakukan pengecekan evaluasi awal fermentasi silase (Cek pH, suhu, dan aroma). Target: 100.00 kg (Konversi: ' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYY-MM-DD') || ')',
    CURRENT_DATE AT TIME ZONE 'Asia/Jakarta',
    'belum',
    'sedang',
    '11111111-1111-1111-1111-111111111106', -- Default Operator Ternak
    'pakan',
    '10:00:00',
    NULL,
    NULL,
    '08:00:00',
    'Konversi Pakan'
)
ON CONFLICT (id_task) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    task_date = EXCLUDED.task_date,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    category = EXCLUDED.category,
    end_time = EXCLUDED.end_time,
    start_time = EXCLUDED.start_time,
    rincian = EXCLUDED.rincian;

-- 5. Buat Tugas Pematangan & Panen Silase Matang (Hari ke-21)
INSERT INTO operations.tasks (
    id_task, title, description, task_date, status,
    priority, id_account, category, end_time,
    schedule_id, id_cage, start_time, rincian
) VALUES (
    'db000008-0000-0000-0000-000000000021',
    'Pematangan & Panen Silase Matang (Hari ke-21)',
    'Proses ensilase 21 hari selesai. Silase matang sempurna dan siap digunakan sebagai pakan. Target: 100.00 kg (Konversi: ' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYY-MM-DD') || ')',
    (CURRENT_DATE + INTERVAL '14 days') AT TIME ZONE 'Asia/Jakarta',
    'belum',
    'tinggi',
    '11111111-1111-1111-1111-111111111106', -- Default Operator Ternak
    'pakan',
    '10:00:00',
    NULL,
    NULL,
    '08:00:00',
    'Konversi Pakan'
)
ON CONFLICT (id_task) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    task_date = EXCLUDED.task_date,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    category = EXCLUDED.category,
    end_time = EXCLUDED.end_time,
    start_time = EXCLUDED.start_time,
    rincian = EXCLUDED.rincian;
