-- 1. AUTH
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
(1, 'Admin', 'full'),
(2, 'Operator', 'write')
ON CONFLICT (id_role) DO NOTHING;

INSERT INTO auth.accounts (id_account, username, password, operator_category, id_role) VALUES 
(1, 'admin',    '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', 1),
(2, 'admin2',   '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', 1),
(3, 'operator', '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'Operator Ternak', 2),
(4, 'pemilik', '$2a$10$8PHzzOyqJ1yZzksdkniRwu.QMB9poSW6L2bez7LAb0mf5AW7KlqIi', 'admin', 1),
(5, 'operator_kebun', '$2a$10$jKQrDmWo58TCu4gxGqNLkOOljHfjZz3LUWfMHAHI9jXvDZQ0gbLzK', 'Operator Kebun', 2),
(6, 'operator_kandang', '$2a$10$Dv.1uSogdgNSiS7DHYT9l.J1QF13E3O8IL8CyU7idNslHOuyGQIJe', 'Operator Ternak', 2),
(7, 'kebun', '$2a$10$XGPpcoBT0lR7ED6/ZemRveUceDy9jjGOlbBb2FfLMfvu6kysnShGm', 'Operator Kebun', 2),
(8, 'peternak', '$2a$10$kSiwtUNVIg1iPp6QdJ99xOuYJfBaTlL4exrut3qjVc9bMOzcYcgAe', 'Operator Ternak', 2)
ON CONFLICT (id_account) DO NOTHING;
SELECT setval('auth.accounts_id_account_seq', COALESCE((SELECT MAX(id_account)+1 FROM auth.accounts), 1), false);

-- 2. FARMS
INSERT INTO master.farms (id, code, name, location, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'F-001', 'Farmease Central', 'Garut, Indonesia', 'Central sheep breeding and research facility')
ON CONFLICT (id) DO NOTHING;

-- 3. CAGES
INSERT INTO master.cages (cage_code, capacity, cage_type, farm_id) VALUES
('K001', 20, 'jantan', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('K002', 20, 'betina', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('K-KAWIN-01', 10, 'campuran', '550e8400-e29b-41d4-a716-446655440001'::UUID)
ON CONFLICT (cage_code) DO NOTHING;

-- 4. SHEEP TYPES
INSERT INTO master.sheep_types (id_type, type_name, type_description) VALUES 
(1, 'Garut', 'Native Garut sheep breed'),
(2, 'Texel', 'Texel meat sheep breed')
ON CONFLICT (id_type) DO NOTHING;
SELECT setval('master.sheep_types_id_type_seq', COALESCE((SELECT MAX(id_type)+1 FROM master.sheep_types), 1), false);

-- 5. SHEEP
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, created_by) VALUES 
(1, 'D-001', 'Pejantan_Alpha', 'jantan', '2020-01-01', 'Sehat', 'beli', 1, 1, 1),
(2, 'D-002', 'Indukan_Alpha', 'betina', '2020-02-01', 'Hamil', 'beli', 2, 1, 1),
(3, 'D-003', 'Pejantan_Beta', 'jantan', '2020-03-01', 'Sakit', 'beli', 1, 1, 1)
ON CONFLICT (sheep_code) DO NOTHING;

INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_sire, id_dam, created_by) VALUES 
(4, 'D-010', 'Anak_Jantan_A', 'jantan', '2022-01-01', 'Sehat', 'lokal', 1, 1, 1, 2, 1),
(5, 'D-011', 'Anak_Betina_A', 'betina', '2022-01-01', 'Sehat', 'lokal', 2, 1, 1, 2, 1)
ON CONFLICT (sheep_code) DO NOTHING;

INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_sire, id_dam, created_by) VALUES 
(6, 'D-020', 'Cucu_Betina_A', 'betina', '2024-01-01', 'Siap Jual', 'lokal', 2, 1, 4, 2, 1)
ON CONFLICT (sheep_code) DO NOTHING;

-- UPDATE existing just in case
UPDATE livestock.sheep SET status = 'Sehat' WHERE sheep_code IN ('D-001', 'D-010', 'D-011') AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Hamil' WHERE sheep_code = 'D-002' AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Sakit' WHERE sheep_code = 'D-003' AND status = 'aktif';
UPDATE livestock.sheep SET status = 'Siap Jual' WHERE sheep_code = 'D-020' AND status = 'aktif';

SELECT setval('livestock.sheep_id_sheep_seq', COALESCE((SELECT MAX(id_sheep)+1 FROM livestock.sheep), 1), false);

-- 6. BREEDINGS
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES 
(1, 1, 2, '2026-01-10', 'koloni', 'sukses', false, 0.00, 'Matched premium Garut sheep parents'),
(2, 4, 2, '2026-05-01', 'kawin_suntik', 'proses', true, 0.25, 'High coefficient of inbreeding test backcross')
ON CONFLICT (id_mating) DO NOTHING;

INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES 
(1, 1, '2026-02-15', 'lahir', '2026-05-15', 'Pregnancy confirmed via ultrasound scan')
ON CONFLICT (id_pregnancy) DO NOTHING;

INSERT INTO breeding.births (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes) VALUES 
(1, 1, '2026-05-15', 1, 'betina', 'sehat', 'Single female lamb born healthy')
ON CONFLICT (id_birth) DO NOTHING;

SELECT setval('breeding.matings_id_mating_seq', COALESCE((SELECT MAX(id_mating)+1 FROM breeding.matings), 1), false);
SELECT setval('breeding.pregnancies_id_pregnancy_seq', COALESCE((SELECT MAX(id_pregnancy)+1 FROM breeding.pregnancies), 1), false);
SELECT setval('breeding.births_id_birth_seq', COALESCE((SELECT MAX(id_birth)+1 FROM breeding.births), 1), false);

-- 7. HEALTHS
INSERT INTO livestock.healths (id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES 
(1, 1, '2026-05-02', 'Healthy - General Checkup', 'Vitamins injection', 'B-Complex', 'Dr. John Doe', 'Active breeding sire in excellent condition'),
(2, 2, '2026-05-03', 'Slight fever', 'Antibiotics and isolation', 'Penicillin', 'Dr. John Doe', 'To be monitored closely for 3 days'),
(3, 4, '2026-05-04', 'Healthy - Post-weaning check', 'Deworming', 'Albendazole', 'Dr. John Doe', 'Normal development')
ON CONFLICT (id_health) DO NOTHING;
SELECT setval('livestock.healths_id_health_seq', COALESCE((SELECT MAX(id_health)+1 FROM livestock.healths), 1), false);

-- 8. WEIGHTS
INSERT INTO livestock.weights (id_weight, id_sheep, weighing_date, weight_kg, notes) VALUES 
(1, 1, '2026-05-01', 45.50, 'Initial weight registration'),
(2, 1, '2026-05-15', 46.20, 'Regular growth check'),
(3, 2, '2026-05-01', 38.00, 'Healthy female weight'),
(4, 4, '2026-05-10', 25.40, 'Weaned lamb weighing')
ON CONFLICT (id_weight) DO NOTHING;
SELECT setval('livestock.weights_id_weight_seq', COALESCE((SELECT MAX(id_weight)+1 FROM livestock.weights), 1), false);

-- 9. FEEDS
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES 
(1, 'Consantrate Pellet A', 'kg', 500.00, 7500.00, 'pellet', 'internal', 'Premium starter concentrate for rapid growth'),
(2, 'Napier Grass / Rumput Gajah', 'kg', 1200.00, 1500.00, 'greenery', 'internal', 'Fresh chopped forage greenery')
ON CONFLICT (id_feed) DO NOTHING;

INSERT INTO logistics.feedings (id_feeding, id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES 
(1, 1, 1, '2026-05-15', 1.50, 'kg', 'Morning concentrate feed'),
(2, 1, 2, '2026-05-15', 3.00, 'kg', 'Afternoon greenery forage feed'),
(3, 2, 1, '2026-05-15', 1.20, 'kg', 'Standard concentrate feed'),
(4, 4, 1, '2026-05-15', 0.80, 'kg', 'Lamb growth starter concentrate')
ON CONFLICT (id_feeding) DO NOTHING;
SELECT setval('logistics.feeds_id_feed_seq', COALESCE((SELECT MAX(id_feed)+1 FROM logistics.feeds), 1), false);
SELECT setval('logistics.feedings_id_feeding_seq', COALESCE((SELECT MAX(id_feeding)+1 FROM logistics.feedings), 1), false);

-- 10. MANURES
INSERT INTO logistics.manures (id_manure, id_sheep, activity_type, amount, unit, destination_type, notes) VALUES 
(1, 1, 'collection', 5.50, 'kg', 'internal', 'Morning cage manure collection'),
(2, 2, 'collection', 4.80, 'kg', 'internal', 'Morning cage manure collection'),
(3, 4, 'collection', 2.10, 'kg', 'internal', 'Morning cage manure collection')
ON CONFLICT (id_manure) DO NOTHING;
SELECT setval('logistics.manures_id_manure_seq', COALESCE((SELECT MAX(id_manure)+1 FROM logistics.manures), 1), false);

-- 11. TASKS
INSERT INTO operations.tasks (id_task, title, description, task_date, status, id_account, category) VALUES 
(1, 'Weighing Sheep', 'Conduct bi-weekly sheep weighing for all growing lambs', '2026-05-20 09:00:00+00', 'pending', 2, 'weighing'),
(2, 'Admin Report', 'Compile breeding success and inbreeding coefficient reports', '2026-05-18 14:00:00+00', 'pending', 1, 'admin'),
(3, 'Cage Cleaning', 'Clean and sanitize female cage K002', '2026-05-15 08:00:00+00', 'pending', 2, 'maintenance')
ON CONFLICT (id_task) DO NOTHING;
SELECT setval('operations.tasks_id_task_seq', COALESCE((SELECT MAX(id_task)+1 FROM operations.tasks), 1), false);

-- 12. NOTIFICATIONS
INSERT INTO operations.notifications (id_notification, title, message, is_read, id_account, type) VALUES 
(1, 'Welcome to Farmease', 'Your developer account has been initialized successfully.', false, 1, 'system'),
(2, 'New Mating Task Assigned', 'You have been assigned to monitor a new mating process for Sheep D-010.', false, 2, 'reminder'),
(3, 'Task Completed', 'The task to clean female cage K002 has been marked as complete.', true, 2, 'system')
ON CONFLICT (id_notification) DO NOTHING;
SELECT setval('operations.notifications_id_notification_seq', COALESCE((SELECT MAX(id_notification)+1 FROM operations.notifications), 1), false);
