-- 1. AUTH
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'full'),
('00000000-0000-0000-0000-000000000002', 'Operator', 'write')
ON CONFLICT (id_role) DO NOTHING;

INSERT INTO auth.accounts (id_account, username, password, operator_category, id_role) VALUES 
('11111111-1111-1111-1111-111111111101', 'admin',    '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111102', 'admin2',   '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111103', 'operator', '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'Operator Ternak', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111104', 'pemilik', '$2a$10$8PHzzOyqJ1yZzksdkniRwu.QMB9poSW6L2bez7LAb0mf5AW7KlqIi', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111105', 'operator_kebun', '$2a$10$jKQrDmWo58TCu4gxGqNLkOOljHfjZz3LUWfMHAHI9jXvDZQ0gbLzK', 'Operator Kebun', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111106', 'operator_kandang', '$2a$10$Dv.1uSogdgNSiS7DHYT9l.J1QF13E3O8IL8CyU7idNslHOuyGQIJe', 'Operator Ternak', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111107', 'kebun', '$2a$10$XGPpcoBT0lR7ED6/ZemRveUceDy9jjGOlbBb2FfLMfvu6kysnShGm', 'Operator Kebun', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111108', 'peternak', '$2a$10$kSiwtUNVIg1iPp6QdJ99xOuYJfBaTlL4exrut3qjVc9bMOzcYcgAe', 'Operator Ternak', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id_account) DO NOTHING;

-- 2. FARMS
INSERT INTO master.farms (id, code, name, location, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'F-001', 'Farmease Central', 'Garut, Indonesia', 'Central sheep breeding and research facility')
ON CONFLICT (id) DO NOTHING;

-- 3. CAGES
INSERT INTO master.cages (id_cage, cage_code, capacity, cage_type, farm_id, cage_name) VALUES
('33333333-3333-3333-3333-333333333301', 'K001', 20, 'jantan', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang K001 (Pejantan)'),
('33333333-3333-3333-3333-333333333302', 'K002', 20, 'betina', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang K002 (Indukan)'),
('33333333-3333-3333-3333-333333333303', 'K-KAWIN-01', 10, 'campuran', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Perkawinan 1')
ON CONFLICT (cage_code) DO NOTHING;

-- 4. SHEEP TYPES
INSERT INTO master.sheep_types (id_type, type_name, type_description) VALUES 
('22222222-2222-2222-2222-222222222201', 'Garut', 'Native Garut sheep breed'),
('22222222-2222-2222-2222-222222222202', 'Texel', 'Texel meat sheep breed'),
('22222222-2222-2222-2222-222222222203', 'Dorper', 'Dorper meat sheep breed'),
('22222222-2222-2222-2222-222222222204', 'Merino', 'Merino wool sheep breed'),
('22222222-2222-2222-2222-222222222205', 'F2 Dorper', 'F2 crossbreed of Dorper'),
('22222222-2222-2222-2222-222222222206', 'F2 Garut', 'F2 crossbreed of Garut')
ON CONFLICT (id_type) DO NOTHING;

-- 5. SHEEP
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, created_by) VALUES 
('44444444-4444-4444-4444-444444444401', 'D-001', 'Pejantan_Alpha', 'jantan', '2020-01-01', 'Sehat', 'beli', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444402', 'D-002', 'Indukan_Alpha', 'betina', '2020-02-01', 'Hamil', 'beli', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444403', 'D-003', 'Pejantan_Beta', 'jantan', '2020-03-01', 'Sakit', 'beli', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;

INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, created_by) VALUES 
('44444444-4444-4444-4444-444444444404', 'D-010', 'Anak_Jantan_A', 'jantan', '2022-01-01', 'Sehat', 'lokal', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444405', 'D-011', 'Anak_Betina_A', 'betina', '2022-01-01', 'Sehat', 'lokal', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;

INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, created_by) VALUES 
('44444444-4444-4444-4444-444444444406', 'D-020', 'Cucu_Betina_A', 'betina', '2024-01-01', 'Siap Jual', 'lokal', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444404', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;

-- UPDATE existing just in case
UPDATE livestock.sheep SET status = 'Sehat' WHERE sheep_code IN ('D-001', 'D-010', 'D-011') AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Hamil' WHERE sheep_code = 'D-002' AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Sakit' WHERE sheep_code = 'D-003' AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Siap Jual' WHERE sheep_code = 'D-020' AND status = 'aktif';

-- 6. BREEDINGS
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES 
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '2026-01-10', 'koloni', 'sukses', false, 0.00, 'Matched premium Garut sheep parents'),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444404', '44444444-4444-4444-4444-444444444402', '2026-05-01', 'kawin_suntik', 'proses', true, 0.25, 'High coefficient of inbreeding test backcross')
ON CONFLICT (id_mating) DO NOTHING;

INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES 
('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', '2026-02-15', 'lahir', '2026-05-15', 'Pregnancy confirmed via ultrasound scan')
ON CONFLICT (id_pregnancy) DO NOTHING;

INSERT INTO breeding.births (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes) VALUES 
('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666601', '2026-05-15', 1, 'betina', 'sehat', 'Single female lamb born healthy')
ON CONFLICT (id_birth) DO NOTHING;

-- 7. HEALTHS
INSERT INTO livestock.healths (id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES 
('88888888-8888-8888-8888-888888888801', '44444444-4444-4444-4444-444444444401', '2026-05-02', 'Healthy - General Checkup', 'Vitamins injection', 'B-Complex', 'Dr. John Doe', 'Active breeding sire in excellent condition'),
('88888888-8888-8888-8888-888888888802', '44444444-4444-4444-4444-444444444402', '2026-05-03', 'Slight fever', 'Antibiotics and isolation', 'Penicillin', 'Dr. John Doe', 'To be monitored closely for 3 days'),
('88888888-8888-8888-8888-888888888803', '44444444-4444-4444-4444-444444444404', '2026-05-04', 'Healthy - Post-weaning check', 'Deworming', 'Albendazole', 'Dr. John Doe', 'Normal development')
ON CONFLICT (id_health) DO NOTHING;

-- 8. WEIGHTS
INSERT INTO livestock.weights (id_weight, id_sheep, weighing_date, weight_kg, notes) VALUES 
('99999999-9999-9999-9999-999999999901', '44444444-4444-4444-4444-444444444401', '2026-05-01', 45.50, 'Initial weight registration'),
('99999999-9999-9999-9999-999999999902', '44444444-4444-4444-4444-444444444401', '2026-05-15', 46.20, 'Regular growth check'),
('99999999-9999-9999-9999-999999999903', '44444444-4444-4444-4444-444444444402', '2026-05-01', 38.00, 'Healthy female weight'),
('99999999-9999-9999-9999-999999999904', '44444444-4444-4444-4444-444444444404', '2026-05-10', 25.40, 'Weaned lamb weighing')
ON CONFLICT (id_weight) DO NOTHING;

-- 9. FEEDS
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consantrate Pellet A', 'kg', 500.00, 7500.00, 'pellet', 'internal', 'Premium starter concentrate for rapid growth'),
('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', 'Napier Grass / Rumput Gajah', 'kg', 1200.00, 1500.00, 'greenery', 'internal', 'Fresh chopped forage greenery')
ON CONFLICT (id_feed) DO NOTHING;

INSERT INTO logistics.feedings (id_feeding, id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES 
('feedfeed-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444401', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.50, 'kg', 'Morning concentrate feed'),
('feedfeed-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444401', 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '2026-05-15', 3.00, 'kg', 'Afternoon greenery forage feed'),
('feedfeed-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444402', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.20, 'kg', 'Standard concentrate feed'),
('feedfeed-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444404', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 0.80, 'kg', 'Lamb growth starter concentrate')
ON CONFLICT (id_feeding) DO NOTHING;

-- 10. MANURES
INSERT INTO logistics.manures (id_manure, id_sheep, activity_type, amount, unit, destination_type, notes) VALUES 
('cccccccc-cccc-cccc-cccc-cccccccc0001', '44444444-4444-4444-4444-444444444401', 'collection', 5.50, 'kg', 'internal', 'Morning cage manure collection'),
('cccccccc-cccc-cccc-cccc-cccccccc0002', '44444444-4444-4444-4444-444444444402', 'collection', 4.80, 'kg', 'internal', 'Morning cage manure collection'),
('cccccccc-cccc-cccc-cccc-cccccccc0003', '44444444-4444-4444-4444-444444444404', 'collection', 2.10, 'kg', 'internal', 'Morning cage manure collection')
ON CONFLICT (id_manure) DO NOTHING;

-- 11. TASKS
INSERT INTO operations.tasks (id_task, title, description, task_date, status, id_account, category) VALUES 
('dddddddd-dddd-dddd-dddd-dddddddd0001', 'Weighing Sheep', 'Conduct bi-weekly sheep weighing for all growing lambs', '2026-05-20 09:00:00+00', 'pending', '11111111-1111-1111-1111-111111111102', 'weighing'),
('dddddddd-dddd-dddd-dddd-dddddddd0002', 'Admin Report', 'Compile breeding success and inbreeding coefficient reports', '2026-05-18 14:00:00+00', 'pending', '11111111-1111-1111-1111-111111111101', 'admin'),
('dddddddd-dddd-dddd-dddd-dddddddd0003', 'Cage Cleaning', 'Clean and sanitize female cage K002', '2026-05-15 08:00:00+00', 'pending', '11111111-1111-1111-1111-111111111102', 'maintenance')
ON CONFLICT (id_task) DO NOTHING;

-- 12. NOTIFICATIONS
INSERT INTO operations.notifications (id_notification, title, message, is_read, id_account, type) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'Welcome to Farmease', 'Your developer account has been initialized successfully.', false, '11111111-1111-1111-1111-111111111101', 'system'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'New Mating Task Assigned', 'You have been assigned to monitor a new mating process for Sheep D-010.', false, '11111111-1111-1111-1111-111111111102', 'reminder'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'Task Completed', 'The task to clean female cage K002 has been marked as complete.', true, '11111111-1111-1111-1111-111111111102', 'system')
ON CONFLICT (id_notification) DO NOTHING;

-- 13. LAHAN (GARDENING)
INSERT INTO gardening.lahan (id_lahan, kode_lahan, nama_lahan, status_lahan, varietas, jenis_tanaman, luas_lahan, kapasitas_maksimal, tanggal_tanam, fase_tanam) VALUES
('b1111111-1111-1111-1111-111111111101', 'L001', 'Lahan Alpukat', 1, 'Alpukat Aligator, Alpukat Miki, dll', 'Alpukat', 100000, 100, '2020-01-01', 'Generatif'),
('b1111111-1111-1111-1111-111111111102', 'L002', 'Lahan Kelengkeng', 1, 'Kelengkeng Itoh, dll', 'Kelengkeng', 80000, 80, '2020-01-01', 'Vegetatif')
ON CONFLICT (kode_lahan) DO NOTHING;

-- 14. POHON (GARDENING)
INSERT INTO gardening.pohon (id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, Lahan_id_lahan) VALUES
('c1111111-1111-1111-1111-111111111101', 'LA001', '2020-01-01', 'Alpukat Aligator', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111102', 'LA002', '2020-01-01', 'Alpukat Aligator', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111103', 'LA003', '2020-01-01', 'Alpukat Aligator', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111104', 'LA004', '2020-01-01', 'Alpukat Aligator', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111105', 'LA005', '2020-01-01', 'Alpukat Aligator', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111106', 'LA006', '2020-01-01', 'Alpukat Miki', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111107', 'LA007', '2020-01-01', 'Alpukat Miki', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111108', 'LA008', '2020-01-01', 'Alpukat Miki', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111109', 'LA009', '2020-01-01', 'Alpukat Miki', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111110', 'LA010', '2020-01-01', 'Alpukat Miki', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111111', 'LA011', '2020-01-01', 'Alpukat Markus', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111112', 'LA012', '2020-01-01', 'Alpukat Markus', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111113', 'LA013', '2020-01-01', 'Alpukat Markus', 'Generatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111114', 'LA014', '2020-01-01', 'Alpukat Kelud', 'Vegetatif', 'b1111111-1111-1111-1111-111111111101'),
('c1111111-1111-1111-1111-111111111115', 'LA015', '2020-01-01', 'Alpukat Kelud', 'Generatif', 'b1111111-1111-1111-1111-111111111101')
ON CONFLICT (kode_pohon) DO NOTHING;
