-- Seed Matings
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES 
(1, 1, 2, '2026-01-10', 'koloni', 'sukses', false, 0.00, 'Matched premium Garut sheep parents'),
(2, 4, 2, '2026-05-01', 'kawin_suntik', 'proses', true, 0.25, 'High coefficient of inbreeding test backcross')
ON CONFLICT (id_mating) DO NOTHING;

-- Seed Pregnancies
INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES 
(1, 1, '2026-02-15', 'lahir', '2026-05-15', 'Pregnancy confirmed via ultrasound scan')
ON CONFLICT (id_pregnancy) DO NOTHING;

-- Seed Births
INSERT INTO breeding.births (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes) VALUES 
(1, 1, '2026-05-15', 1, 'betina', 'sehat', 'Single female lamb born healthy')
ON CONFLICT (id_birth) DO NOTHING;

-- Adjust sequences
SELECT setval('breeding.matings_id_mating_seq', COALESCE((SELECT MAX(id_mating)+1 FROM breeding.matings), 1), false);
SELECT setval('breeding.pregnancies_id_pregnancy_seq', COALESCE((SELECT MAX(id_pregnancy)+1 FROM breeding.pregnancies), 1), false);
SELECT setval('breeding.births_id_birth_seq', COALESCE((SELECT MAX(id_birth)+1 FROM breeding.births), 1), false);
