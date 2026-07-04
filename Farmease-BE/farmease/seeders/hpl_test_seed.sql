-- HPL Test Seeder for Birth Alerts H-7 and H-5
-- Run this script to populate target test data for pregnancies and birthing alerts

-- 1. Ensure the types exist
INSERT INTO livestock.sheep_types (id_type, type_name, type_description) VALUES 
('22222222-2222-2222-2222-222222222201', 'Garut', 'Native Garut sheep breed')
ON CONFLICT (id_type) DO NOTHING;

-- 2. Seed active test sheep for pregnancy (B-01 and XG893)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, created_by) VALUES 
('55555555-5555-5555-5555-555555555591', 'J-01', 'Pejantan J-01', 'jantan', '2022-06-01', 'aktif', 'lokal', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('55555555-5555-5555-5555-555555555592', 'B-01', 'Indukan B-01', 'betina', '2022-06-01', 'hamil', 'lokal', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('55555555-5555-5555-5555-555555555502', 'XG893', 'Mak Bocil', 'betina', '2024-01-14', 'hamil', 'lokal', '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO UPDATE 
SET status = EXCLUDED.status;

-- 3. Seed Mating records
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES 
('55555555-5555-5555-5555-555555555502', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555502', '2026-05-01', 'ib', 'proses', true, 0.25, 'High coefficient of inbreeding test backcross'),
('55555555-5555-5555-5555-555555555503', '55555555-5555-5555-5555-555555555591', '55555555-5555-5555-5555-555555555592', '2026-05-01', 'alami', 'sukses', false, 0.00, 'Test mating for B-01')
ON CONFLICT (id_mating) DO NOTHING;

-- 4. Seed Pregnancy records (status: 'dikandung')
-- Mak Bocil (XG893) expected to give birth in 4 days (H-4)
-- Indukan B-01 (B-01) expected to give birth in 5 days (H-5)
INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES 
('66666666-6666-6666-6666-666666666602', '55555555-5555-5555-5555-555555555502', CURRENT_DATE - INTERVAL '146 days', 'dikandung', CURRENT_DATE + INTERVAL '4 days', 'Pregnancy test seeder for birth alert H-7'),
('66666666-6666-6666-6666-666666666603', '55555555-5555-5555-5555-555555555503', CURRENT_DATE - INTERVAL '145 days', 'dikandung', CURRENT_DATE + INTERVAL '5 days', 'Pregnancy alert for B-01 H-5')
ON CONFLICT (id_pregnancy) DO UPDATE 
SET expected_birth_date = EXCLUDED.expected_birth_date,
    pregnancy_status = 'dikandung';
