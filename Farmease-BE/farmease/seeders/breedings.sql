-- Seed Matings
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES 
('55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555502', '2026-01-10', 'alami', 'sukses', false, 0.00, 'Matched premium Garut sheep parents'),
('55555555-5555-5555-5555-555555555502', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555502', '2026-05-01', 'ib', 'proses', true, 0.25, 'High coefficient of inbreeding test backcross')
ON CONFLICT (id_mating) DO NOTHING;

-- Seed Pregnancies
INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES 
('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', '2026-02-15', 'melahirkan', '2026-05-15', 'Pregnancy confirmed via ultrasound scan')
ON CONFLICT (id_pregnancy) DO NOTHING;

-- Seed Births
INSERT INTO breeding.births (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes) VALUES 
('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666601', '2026-05-15', 1, 'betina', 'sehat', 'Single female lamb born healthy')
ON CONFLICT (id_birth) DO NOTHING;
