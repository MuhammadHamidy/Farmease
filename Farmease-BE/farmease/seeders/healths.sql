-- ============================================================================
-- SEEDER: module/healths (livestock.healths)
-- UUID valid hex: ad=healths
-- ============================================================================

INSERT INTO livestock.healths (id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES

-- ============ D177 / Toni ============
('ad000001-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', '2026-01-10', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Kondisi tubuh BCS 3.5, aktif dan nafsu makan baik'),
('ad000001-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555501', '2026-02-10', 'Vaksin Enterotoxemia', 'Vaksinasi', 'Vaksin Clostridium C&D', 'drh. Ahmad', 'Dosis pertama vaksin Enterotoxemia, 2 ml IM'),
('ad000001-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555501', '2026-03-10', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Albendazole 10%', 'drh. Ahmad', 'Dosis 7.5 mg/kgBB PO, ulang 2 minggu'),
('ad000001-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555501', '2026-04-10', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE', 'drh. Ahmad', 'Injeksi vitamin ADE 2 ml IM'),
('ad000001-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555501', '2026-05-10', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'BCS 3.5, berat 47.1 kg, kondisi prima'),
('ad000001-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555501', '2026-06-10', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Persiapan pre-mating, semua nilai normal'),

-- ============ XG893 / Mak Bocil (Indukan hamil) ============
('ad000002-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555502', '2026-01-15', 'Kontrol Kebuntingan', 'Pemeriksaan Kebuntingan', 'Vitamin ADE', 'drh. Ahmad', 'Ultrasound positif bunting, HPL diperkirakan Juli 2026'),
('ad000002-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555502', '2026-02-15', 'Vitamin Prenatal', 'Aplikasi ADE', 'Vitamin ADE + B-Complex', 'drh. Ahmad', 'Suplemen vitamin prenatal untuk janin'),
('ad000002-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555502', '2026-03-15', 'Obat Cacing Prenatal', 'Pemberian Obat Cacing', 'Fenbendazole', 'drh. Ahmad', 'Fenbendazole aman untuk betina bunting, 5 mg/kgBB'),
('ad000002-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555502', '2026-04-15', 'Kontrol Kebuntingan', 'Pemeriksaan Kebuntingan', NULL, 'drh. Ahmad', 'Palpasi perut, perkembangan janin normal'),
('ad000002-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555502', '2026-05-15', 'Vaksin Booster', 'Vaksinasi', 'Clostridium C&D Booster', 'drh. Ahmad', 'Vaksin booster 4 minggu sebelum lahir untuk kekebalan kolostrum'),
('ad000002-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555502', '2026-06-15', 'Kontrol Menjelang Lahir', 'Pemeriksaan Akhir', 'Calcium + Vitamin E', 'drh. Ahmad', 'Pemberian kalsium dan Vit E pre-partum, posisi janin normal'),

-- ============ XD009 / Bocil ============
('ad000003-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555503', '2025-10-05', 'Pemeriksaan Neonatus', 'Pemeriksaan Anak & Induk', 'Antiseptik Tali Pusar', 'drh. Ahmad', 'Lahir sehat, tali pusar disinfeksi dengan yodium 10%'),
('ad000003-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555503', '2025-11-05', 'Vaksinasi Pertama', 'Vaksinasi', 'Vaksin Enterotoxemia', 'drh. Ahmad', 'Vaksin pertama umur 4 minggu, 1 ml SC'),
('ad000003-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555503', '2025-12-05', 'Obat Cacing Pertama', 'Pemberian Obat Cacing', 'Albendazole', 'drh. Ahmad', 'Obat cacing pertama umur 2 bulan'),
('ad000003-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555503', '2026-01-05', 'Vitamin Tumbuh', 'Aplikasi ADE', 'Vitamin ADE', 'drh. Ahmad', 'Suplementasi vitamin untuk pertumbuhan optimal'),
('ad000003-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555503', '2026-03-05', 'Vaksinasi Booster', 'Vaksinasi', 'Vaksin Enterotoxemia Booster', 'drh. Ahmad', 'Booster vaksin umur 5 bulan'),
('ad000003-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555503', '2026-05-05', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Perkembangan baik, BCS 3.0'),
('ad000003-0000-0000-0000-000000000007', '55555555-5555-5555-5555-555555555503', '2026-07-01', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Albendazole', 'drh. Ahmad', 'Obat cacing berkala umur 9 bulan'),

-- ============ XG894 / Ilina (birahi) ============
('ad000004-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555504', '2026-01-10', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Kondisi reproduksi normal, siap kawin'),
('ad000004-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555504', '2026-03-10', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE', 'drh. Ahmad', 'Suplementasi vitamin untuk kondisi reproduksi'),
('ad000004-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555504', '2026-05-10', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Ivermectin', 'drh. Ahmad', 'Ivermectin 200 mcg/kgBB SC'),

-- ============ XG817 / Dian ============
('ad000005-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555505', '2026-02-01', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Kondisi baik, BCS 3.0'),
('ad000005-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555505', '2026-04-01', 'Diare Ringan', 'Pemberian Antibiotik', 'Antibiotik Amoxicillin', 'drh. Ahmad', 'Konsistensi feses lembek, diberikan antibiotik 5 hari'),
('ad000005-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555505', '2026-05-01', 'Kontrol Pasca Sakit', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Pulih sempurna, feses normal kembali'),
('ad000005-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555505', '2026-06-15', 'Vitamin Rutin', 'Pemberian Vit B-Complex', 'Vit B-Complex', 'drh. Ahmad', 'Vitamin B-Complex untuk nafsu makan'),

-- ============ XG827 / Rina ============
('ad000006-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555506', '2026-02-01', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Albendazole', 'drh. Ahmad', 'Albendazole 7.5 mg/kgBB'),
('ad000006-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555506', '2026-04-15', 'Vaksinasi Rutin', 'Vaksinasi', 'Vaksin Clostridium C&D', 'drh. Ahmad', 'Vaksinasi tahunan booster'),
('ad000006-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555506', '2026-06-01', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'BCS 3.0, kondisi prima'),

-- ============ XG858 / Bonita ============
('ad000007-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555507', '2026-01-20', 'Kaki Pincang', 'Pemberian Antibiotik', 'Antibiotik Penicillin', 'drh. Ahmad', 'Luka kecil pada kuku, dibersihkan dan diobati dengan antibiotik topikal'),
('ad000007-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555507', '2026-02-05', 'Kontrol Kaki', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Luka sembuh, kondisi kaki normal kembali'),
('ad000007-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555507', '2026-04-20', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE', 'drh. Ahmad', 'Suplementasi vitamin rutin'),
('ad000007-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555507', '2026-06-20', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Ivermectin', 'drh. Ahmad', 'Ivermectin injeksi SC'),

-- ============ XG859 / Shafa ============
('ad000008-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555508', '2026-02-10', 'Sehat - Pemeriksaan Rutin', 'Tidak ada tindakan', NULL, 'drh. Ahmad', 'Kondisi baik, BCS 3.0'),
('ad000008-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555508', '2026-04-10', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Albendazole', 'drh. Ahmad', 'Obat cacing berkala'),
('ad000008-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555508', '2026-06-10', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE', 'drh. Ahmad', 'Vitamin ADE rutin'),

-- ============ J-01 / Pejantan J-01 ============
('ad000009-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555591', '2026-01-25', 'Pemeriksaan Pre-Mating', 'Pemeriksaan Medis', NULL, 'drh. Ahmad', 'Sperma dievaluasi, kualitas A (motilitas >70%)'),
('ad000009-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555591', '2026-03-25', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE + E', 'drh. Ahmad', 'Vitamin ADE dan E untuk kualitas sperma'),
('ad000009-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555591', '2026-05-25', 'Vaksinasi Rutin', 'Vaksinasi', 'Vaksin Clostridium C&D', 'drh. Ahmad', 'Vaksinasi tahunan'),

-- ============ B-01 / Indukan B-01 (hamil) ============
('ad000010-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555592', '2026-01-20', 'Konfirmasi Kebuntingan', 'Pemeriksaan Kebuntingan', NULL, 'drh. Ahmad', 'Ultrasound: positif bunting, estimasi 1 anak'),
('ad000010-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555592', '2026-03-20', 'Vitamin Prenatal', 'Aplikasi ADE', 'Vitamin ADE + Calcium', 'drh. Ahmad', 'Suplementasi kalsium untuk perkembangan tulang janin'),
('ad000010-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555592', '2026-05-20', 'Vaksin Booster', 'Vaksinasi', 'Clostridium C&D Booster', 'drh. Ahmad', 'Booster 4 minggu sebelum HPL untuk kekebalan kolostrum'),
('ad000010-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555592', '2026-06-25', 'Kontrol Menjelang Lahir', 'Pemeriksaan Akhir', 'Calcium Borogluconate', 'drh. Ahmad', 'Calcium bolus pre-partum, posisi janin anterior normal'),

-- ============ XD010 / Goliath ============
('ad000011-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555543', '2026-02-20', 'Pemeriksaan Pre-Mating', 'Pemeriksaan Medis', NULL, 'drh. Ahmad', 'Sperma kualitas A, siap digunakan untuk kawin'),
('ad000011-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555543', '2026-04-20', 'Obat Cacing Rutin', 'Pemberian Obat Cacing', 'Ivermectin', 'drh. Ahmad', 'Ivermectin 200 mcg/kgBB'),
('ad000011-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555543', '2026-06-20', 'Vitamin Rutin', 'Aplikasi ADE', 'Vitamin ADE + E', 'drh. Ahmad', 'Suplementasi untuk kualitas sperma')

ON CONFLICT (id_health) DO NOTHING;
