-- ============================================================================
-- SEEDER: module/breedings (breeding.matings + breeding.pregnancies + breeding.births)
-- UUID valid hex: aa=matings, ab=pregnancies, ac=births
-- ============================================================================

-- ============================
-- MATINGS
-- ============================
INSERT INTO breeding.matings (id_mating, id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes) VALUES

('aa000001-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555502',
 '2026-01-10', 'alami', 'sukses', false, 0.00, 'Kawin alami D177 x XG893, Jan 2026'),

('aa000002-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555591', '55555555-5555-5555-5555-555555555592',
 '2026-01-15', 'alami', 'sukses', false, 0.00, 'Kawin alami J-01 x B-01 untuk pengujian HPL'),

('aa000003-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555505',
 '2024-11-01', 'alami', 'sukses', false, 0.00, 'Kawin Nov 2024 -> lahir Agu 2025'),

('aa000004-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555502',
 '2024-12-01', 'alami', 'sukses', false, 0.00, 'Kawin Des 2024 -> lahir Okt 2025'),

-- Kawin Okt 2025 -> lahir Mar 2026
('aa000005-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555506',
 '2025-10-05', 'alami', 'sukses', false, 0.00, 'Kawin Okt 2025 -> lahir Mar 2026 (XG827/Rina)'),
('aa000005-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555507',
 '2025-10-12', 'alami', 'sukses', false, 0.00, 'Kawin Okt 2025 -> lahir Mar 2026 (XG858/Bonita)'),

-- Kawin Nov 2025 -> lahir Apr 2026
('aa000006-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555508',
 '2025-11-08', 'alami', 'sukses', false, 0.00, 'Kawin Nov 2025 -> lahir Apr 2026 (XG859/Shafa)'),
('aa000006-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555591', '55555555-5555-5555-5555-555555555509',
 '2025-11-15', 'alami', 'sukses', false, 0.00, 'Kawin Nov 2025 -> lahir Apr 2026 (XG882/Tania, J-01)'),

-- Kawin Des 2025 -> lahir Mei 2026
('aa000007-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555510',
 '2025-12-05', 'alami', 'sukses', false, 0.00, 'Kawin Des 2025 -> lahir Mei 2026 (XG875/Reni)'),
('aa000007-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555591', '55555555-5555-5555-5555-555555555511',
 '2025-12-10', 'inseminasi buatan', 'sukses', false, 0.00, 'IB Des 2025 -> lahir Mei 2026 (XG829/Dora)'),
('aa000007-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555543', '55555555-5555-5555-5555-555555555512',
 '2025-12-18', 'alami', 'sukses', false, 0.00, 'Kawin Des 2025 (XD010) -> lahir Mei 2026 (XG840/Nita)'),

-- Kawin Jan 2026 -> lahir Jun 2026
('aa000008-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555513',
 '2026-01-08', 'alami', 'sukses', false, 0.00, 'Kawin Jan 2026 -> lahir Jun 2026 (XG855/Yuni)'),
('aa000008-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555591', '55555555-5555-5555-5555-555555555514',
 '2026-01-12', 'alami', 'sukses', false, 0.00, 'Kawin Jan 2026 (J-01) -> lahir Jun 2026 (XG842/Susi)')

ON CONFLICT (id_mating) DO NOTHING;


-- ============================
-- PREGNANCIES
-- ============================
INSERT INTO breeding.pregnancies (id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes) VALUES

-- Aktif: XG893 (Mak Bocil) -> HPL = CURRENT_DATE + 4 hari
('ab000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001',
 '2026-01-25', 'dikandung', CURRENT_DATE + INTERVAL '4 days',
 'Kebuntingan XG893 dikonfirmasi ultrasound. Janin tunggal, posisi anterior.'),

-- Aktif: B-01 -> HPL = CURRENT_DATE + 5 hari
('ab000002-0000-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000001',
 '2026-01-30', 'dikandung', CURRENT_DATE + INTERVAL '5 days',
 'Kebuntingan B-01 dikonfirmasi palpasi. Estimasi 1-2 anak.'),

-- Selesai: Kelahiran historis Maret 2026
('ab000005-0000-0000-0000-000000000001', 'aa000005-0000-0000-0000-000000000001',
 '2025-10-20', 'melahirkan', '2026-03-08',
 'Kebuntingan XG827/Rina dikonfirmasi, lahir Mar 2026'),
('ab000005-0000-0000-0000-000000000002', 'aa000005-0000-0000-0000-000000000002',
 '2025-10-28', 'melahirkan', '2026-03-15',
 'Kebuntingan XG858/Bonita dikonfirmasi, lahir Mar 2026'),

-- Selesai: Kelahiran historis April 2026
('ab000006-0000-0000-0000-000000000001', 'aa000006-0000-0000-0000-000000000001',
 '2025-11-23', 'melahirkan', '2026-04-12',
 'Kebuntingan XG859/Shafa dikonfirmasi, lahir Apr 2026'),
('ab000006-0000-0000-0000-000000000002', 'aa000006-0000-0000-0000-000000000002',
 '2025-11-30', 'melahirkan', '2026-04-20',
 'Kebuntingan XG882/Tania dikonfirmasi, lahir Apr 2026'),

-- Selesai: Kelahiran historis Mei 2026
('ab000007-0000-0000-0000-000000000001', 'aa000007-0000-0000-0000-000000000001',
 '2025-12-20', 'melahirkan', '2026-05-10',
 'Kebuntingan XG875/Reni dikonfirmasi, lahir Mei 2026'),
('ab000007-0000-0000-0000-000000000002', 'aa000007-0000-0000-0000-000000000002',
 '2025-12-25', 'melahirkan', '2026-05-15',
 'Kebuntingan XG829/Dora dikonfirmasi (IB), lahir Mei 2026'),
('ab000007-0000-0000-0000-000000000003', 'aa000007-0000-0000-0000-000000000003',
 '2026-01-02', 'melahirkan', '2026-05-22',
 'Kebuntingan XG840/Nita dikonfirmasi (XD010), lahir Mei 2026'),

-- Selesai: Kelahiran historis Juni 2026
('ab000008-0000-0000-0000-000000000001', 'aa000008-0000-0000-0000-000000000001',
 '2026-01-23', 'melahirkan', '2026-06-08',
 'Kebuntingan XG855/Yuni dikonfirmasi, lahir Jun 2026'),
('ab000008-0000-0000-0000-000000000002', 'aa000008-0000-0000-0000-000000000002',
 '2026-01-27', 'melahirkan', '2026-06-18',
 'Kebuntingan XG842/Susi dikonfirmasi (J-01), lahir Jun 2026')

ON CONFLICT (id_pregnancy) DO NOTHING;


-- ============================
-- BIRTHS
-- ============================
INSERT INTO breeding.births (id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes) VALUES

-- Maret 2026 - 2 kelahiran
('ac000003-0000-0000-0000-000000000001', 'ab000005-0000-0000-0000-000000000001',
 '2026-03-08', 2, 'campuran', 'sehat',
 'Kelahiran kembar: 1 jantan (3.2 kg) + 1 betina (2.9 kg). Indukan XG827/Rina sehat.'),
('ac000003-0000-0000-0000-000000000002', 'ab000005-0000-0000-0000-000000000002',
 '2026-03-15', 1, 'betina', 'sehat',
 'Kelahiran tunggal betina 3.0 kg. Indukan XG858/Bonita sehat.'),

-- April 2026 - 2 kelahiran
('ac000004-0000-0000-0000-000000000001', 'ab000006-0000-0000-0000-000000000001',
 '2026-04-12', 1, 'jantan', 'sehat',
 'Kelahiran tunggal jantan 3.5 kg. Indukan XG859/Shafa sehat.'),
('ac000004-0000-0000-0000-000000000002', 'ab000006-0000-0000-0000-000000000002',
 '2026-04-20', 2, 'campuran', 'sehat',
 'Kelahiran kembar: 1 jantan (3.1 kg) + 1 betina (2.8 kg). Indukan XG882/Tania sehat.'),

-- Mei 2026 - 3 kelahiran
('ac000005-0000-0000-0000-000000000001', 'ab000007-0000-0000-0000-000000000001',
 '2026-05-10', 1, 'betina', 'sehat',
 'Kelahiran tunggal betina 2.8 kg. Indukan XG875/Reni sehat.'),
('ac000005-0000-0000-0000-000000000002', 'ab000007-0000-0000-0000-000000000002',
 '2026-05-15', 1, 'jantan', 'sehat',
 'Kelahiran hasil IB, jantan 3.3 kg. Indukan XG829/Dora sehat.'),
('ac000005-0000-0000-0000-000000000003', 'ab000007-0000-0000-0000-000000000003',
 '2026-05-22', 2, 'jantan', 'sehat',
 'Kelahiran kembar jantan 3.2 kg + 3.0 kg. Indukan XG840/Nita sehat. Pejantan XD010/Goliath.'),

-- Juni 2026 - 2 kelahiran
('ac000006-0000-0000-0000-000000000001', 'ab000008-0000-0000-0000-000000000001',
 '2026-06-08', 1, 'betina', 'sehat',
 'Kelahiran tunggal betina 3.1 kg. Indukan XG855/Yuni sehat.'),
('ac000006-0000-0000-0000-000000000002', 'ab000008-0000-0000-0000-000000000002',
 '2026-06-18', 2, 'campuran', 'sehat',
 'Kelahiran kembar: 1 jantan (3.4 kg) + 1 betina (3.0 kg). Indukan XG842/Susi sehat. Pejantan J-01.')

ON CONFLICT (id_birth) DO NOTHING;
