-- ============================================================================
-- SEEDER: module/submissions (operations.pencatatan_submissions)
-- UUID valid hex: ba=submissions
-- ============================================================================

INSERT INTO operations.pencatatan_submissions (
    id_submission, submission_code, type, type_label,
    operator_code, operator_name,
    cage_code, scope, summary, payload,
    submitted_at, approval_status, reviewed_at, reviewed_by, review_note
) VALUES

-- ============================================================
-- KATEGORI: Cek Birahi
-- ============================================================
(
    'ba000001-0000-0000-0000-000000000001',
    'SUB-BIRAHI-001',
    'Cek Birahi', 'Cek Birahi',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Cek birahi XG894 (Ilina) - hasil: birahi',
    '{"items": [{"name": "Cek Birahi", "targetId": "XG894", "hasilPemeriksaan": "birahi", "tanggal": "2026-07-05", "catatan": "Tanda vulva kemerahan dan bengkak"}]}'::jsonb,
    NOW() - INTERVAL '2 hours', 'approved', NOW() - INTERVAL '1 hour', 'Admin', 'Terverifikasi'
),
(
    'ba000001-0000-0000-0000-000000000002',
    'SUB-BIRAHI-002',
    'Cek Birahi', 'Cek Birahi',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Cek birahi XG817 (Dian) - hasil: birahi',
    '{"items": [{"name": "Cek Birahi", "targetId": "XG817", "hasilPemeriksaan": "birahi", "tanggal": "2026-07-05", "catatan": "Aktif gelisah, nafsu makan turun"}]}'::jsonb,
    NOW() - INTERVAL '3 hours', 'approved', NOW() - INTERVAL '2 hours', 'Admin', 'Terverifikasi'
),
(
    'ba000001-0000-0000-0000-000000000003',
    'SUB-BIRAHI-003',
    'Cek Birahi', 'Cek Birahi',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Cek birahi XG827 (Rina) - hasil: tidak birahi',
    '{"items": [{"name": "Cek Birahi", "targetId": "XG827", "hasilPemeriksaan": "tidak birahi", "tanggal": "2026-07-04", "catatan": "Kondisi normal, belum menunjukkan tanda birahi"}]}'::jsonb,
    NOW() - INTERVAL '1 day', 'approved', NOW() - INTERVAL '20 hours', 'Admin', 'Terverifikasi'
),

-- ============================================================
-- KATEGORI: Pencatatan Pakan
-- ============================================================
(
    'ba000002-0000-0000-0000-000000000001',
    'SUB-PAKAN-001',
    'Pencatatan Pakan', 'Pencatatan Pakan',
    'OP-SAMSUL', 'Samsul',
    'K-ANAKAN-01', 'kandang',
    'Pakan pagi kandang anakan - Odot + Bekatul',
    '{"items": [{"name": "Pakan Pagi", "targetId": "K-ANAKAN-01", "qty": "18", "unit": "kg", "metoda": "dadakan", "hijauan": "Odot", "energi": "Bekatul", "protein": "Ampas Tahu"}]}'::jsonb,
    NOW() - INTERVAL '6 hours', 'approved', NOW() - INTERVAL '5 hours', 'Admin', NULL
),
(
    'ba000002-0000-0000-0000-000000000002',
    'SUB-PAKAN-002',
    'Pencatatan Pakan', 'Pencatatan Pakan',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'kandang',
    'Pakan pagi kandang indukan - Rumput Gajah + Pellet',
    '{"items": [{"name": "Pakan Pagi", "targetId": "K-INDUKAN-01", "qty": "35", "unit": "kg", "metoda": "dadakan", "hijauan": "Rumput Gajah", "energi": "Bekatul", "protein": "Bungkil Kelapa Sawit"}]}'::jsonb,
    NOW() - INTERVAL '6 hours', 'approved', NOW() - INTERVAL '5 hours', 'Admin', NULL
),
(
    'ba000002-0000-0000-0000-000000000003',
    'SUB-PAKAN-003',
    'Pencatatan Pakan', 'Pencatatan Pakan',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'kandang',
    'Pakan sore kandang indukan - Silase Campuran',
    '{"items": [{"name": "Pakan Sore", "targetId": "K-INDUKAN-01", "qty": "30", "unit": "kg", "metoda": "silase", "hijauan": "Pakan Silase Campuran"}]}'::jsonb,
    NOW() - INTERVAL '1 day' - INTERVAL '2 hours', 'approved', NOW() - INTERVAL '1 day', 'Admin', NULL
),
(
    'ba000002-0000-0000-0000-000000000004',
    'SUB-PAKAN-004',
    'Pencatatan Pakan', 'Pencatatan Pakan',
    'OP-RIAN', 'Rian',
    'K-BATERAI-01', 'sheep',
    'Pakan harian D177 (Toni) - Pellet + Rumput',
    '{"items": [{"name": "Pakan Harian", "targetId": "D177", "qty": "5.5", "unit": "kg", "metoda": "dadakan", "hijauan": "Rumput Gajah", "energi": "Pellet Konsentrat A"}]}'::jsonb,
    NOW() - INTERVAL '2 days', 'approved', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'Admin', NULL
),

-- ============================================================
-- KATEGORI: Pencatatan Timbang
-- ============================================================
(
    'ba000003-0000-0000-0000-000000000001',
    'SUB-TIMBANG-001',
    'Pencatatan Timbang', 'Pencatatan Timbang',
    'OP-SAMSUL', 'Samsul',
    'K-BATERAI-01', 'sheep',
    'Penimbangan rutin D177 (Toni) - 50.2 kg',
    '{"items": [{"name": "Timbang Individu", "targetId": "D177", "qty": "50.2", "unit": "kg", "tanggal": "2026-07-01"}]}'::jsonb,
    NOW() - INTERVAL '4 days', 'approved', NOW() - INTERVAL '3 days', 'Admin', NULL
),
(
    'ba000003-0000-0000-0000-000000000002',
    'SUB-TIMBANG-002',
    'Pencatatan Timbang', 'Pencatatan Timbang',
    'OP-RIAN', 'Rian',
    'K-ANAKAN-01', 'sheep',
    'Penimbangan rutin XD009 (Bocil) - 29.0 kg',
    '{"items": [{"name": "Timbang Individu", "targetId": "XD009", "qty": "29.0", "unit": "kg", "tanggal": "2026-07-01"}]}'::jsonb,
    NOW() - INTERVAL '4 days', 'approved', NOW() - INTERVAL '3 days', 'Admin', NULL
),
(
    'ba000003-0000-0000-0000-000000000003',
    'SUB-TIMBANG-003',
    'Pencatatan Timbang', 'Pencatatan Timbang',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Penimbangan rutin XG893 (Mak Bocil) - 44.0 kg',
    '{"items": [{"name": "Timbang Individu", "targetId": "XG893", "qty": "44.0", "unit": "kg", "tanggal": "2026-07-01"}]}'::jsonb,
    NOW() - INTERVAL '4 days', 'approved', NOW() - INTERVAL '3 days', 'Admin', NULL
),
(
    'ba000003-0000-0000-0000-000000000004',
    'SUB-TIMBANG-004',
    'Pencatatan Timbang', 'Pencatatan Timbang',
    'OP-RIAN', 'Rian',
    'K-BATERAI-03', 'sheep',
    'Penimbangan J-01 (Pejantan J-01) - 42.5 kg',
    '{"items": [{"name": "Timbang Individu", "targetId": "J-01", "qty": "42.5", "unit": "kg", "tanggal": "2026-07-01"}]}'::jsonb,
    NOW() - INTERVAL '4 days', 'approved', NOW() - INTERVAL '3 days', 'Admin', NULL
),

-- ============================================================
-- KATEGORI: Pencatatan Kesehatan
-- ============================================================
(
    'ba000004-0000-0000-0000-000000000001',
    'SUB-SEHAT-001',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-BATERAI-01', 'sheep',
    'Vaksinasi Enterotoxemia D177 (Toni)',
    '{"items": [{"name": "Vaksinasi", "targetId": "D177", "tindakan": "Vaksinasi", "obat": "Vaksin Clostridium C&D", "vitaminAmount": "2 ml IM", "kondisi": "sehat"}]}'::jsonb,
    NOW() - INTERVAL '150 days', 'approved', NOW() - INTERVAL '149 days', 'Admin', NULL
),
(
    'ba000004-0000-0000-0000-000000000002',
    'SUB-SEHAT-002',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-INDUKAN-01', 'sheep',
    'Vitamin Prenatal XG893 (Mak Bocil) - ADE + B-Complex',
    '{"items": [{"name": "Pemberian Vitamin", "targetId": "XG893", "tindakan": "Aplikasi ADE", "obat": "Vitamin ADE + B-Complex", "vitaminAmount": "3 ml IM", "kondisi": "bunting sehat"}]}'::jsonb,
    NOW() - INTERVAL '140 days', 'approved', NOW() - INTERVAL '139 days', 'Admin', NULL
),
(
    'ba000004-0000-0000-0000-000000000003',
    'SUB-SEHAT-003',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-ANAKAN-01', 'sheep',
    'Obat cacing XD009 (Bocil) - Albendazole',
    '{"items": [{"name": "Pemberian Obat Cacing", "targetId": "XD009", "tindakan": "Pemberian Obat Cacing", "obat": "Albendazole 10%", "vitaminAmount": "7.5 mg/kgBB PO", "kondisi": "sehat"}]}'::jsonb,
    NOW() - INTERVAL '30 days', 'approved', NOW() - INTERVAL '29 days', 'Admin', NULL
),
(
    'ba000004-0000-0000-0000-000000000004',
    'SUB-SEHAT-004',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-INDUKAN-01', 'sheep',
    'Kontrol kebuntingan XG893 (Mak Bocil) - menjelang lahir',
    '{"items": [{"name": "Kontrol Kebuntingan", "targetId": "XG893", "tindakan": "Pemeriksaan Kebuntingan", "obat": "Calcium + Vitamin E", "vitaminAmount": "10 ml oral", "kondisi": "bunting sehat, posisi janin normal"}]}'::jsonb,
    NOW() - INTERVAL '20 days', 'approved', NOW() - INTERVAL '19 days', 'Admin', NULL
),
(
    'ba000004-0000-0000-0000-000000000005',
    'SUB-SEHAT-005',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-INDUKAN-01', 'sheep',
    'Vaksin booster XG893 (Mak Bocil) - Clostridium',
    '{"items": [{"name": "Vaksinasi", "targetId": "XG893", "tindakan": "Vaksinasi", "obat": "Clostridium C&D Booster", "vitaminAmount": "2 ml IM", "kondisi": "sehat"}]}'::jsonb,
    NOW() - INTERVAL '45 days', 'approved', NOW() - INTERVAL '44 days', 'Admin', NULL
),
(
    'ba000004-0000-0000-0000-000000000006',
    'SUB-SEHAT-006',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-DOKTER', 'drh. Ahmad',
    'K-INDUKAN-01', 'sheep',
    'Pengobatan diare XG817 (Dian) - Amoxicillin',
    '{"items": [{"name": "Pemberian Antibiotik", "targetId": "XG817", "tindakan": "Pemberian Antibiotik", "obat": "Antibiotik Amoxicillin", "vitaminAmount": "10 mg/kgBB PO", "kondisi": "diare ringan"}]}'::jsonb,
    NOW() - INTERVAL '90 days', 'approved', NOW() - INTERVAL '89 days', 'Admin', 'Pantau 5 hari'
),

-- ============================================================
-- KATEGORI: Pencatatan Kawin
-- ============================================================
(
    'ba000005-0000-0000-0000-000000000001',
    'SUB-KAWIN-001',
    'Pencatatan Kawin', 'Pencatatan Kawin',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Perkawinan alami D177 x XG893 - Jan 2026',
    '{"items": [{"name": "Perkawinan Alami", "targetId": "XG893", "idPejantan": "D177", "metoda": "alami", "tanggal": "2026-01-10", "catatan": "Birahi terkonfirmasi sebelum kawin"}]}'::jsonb,
    '2026-01-10 10:00:00+07', 'approved', '2026-01-10 12:00:00+07', 'Admin', NULL
),
(
    'ba000005-0000-0000-0000-000000000002',
    'SUB-KAWIN-002',
    'Pencatatan Kawin', 'Pencatatan Kawin',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Perkawinan alami J-01 x B-01 - Jan 2026',
    '{"items": [{"name": "Perkawinan Alami", "targetId": "B-01", "idPejantan": "J-01", "metoda": "alami", "tanggal": "2026-01-15", "catatan": "Perkawinan uji coba TC-08a"}]}'::jsonb,
    '2026-01-15 10:00:00+07', 'approved', '2026-01-15 12:00:00+07', 'Admin', NULL
),
(
    'ba000005-0000-0000-0000-000000000003',
    'SUB-KAWIN-003',
    'Pencatatan Kawin', 'Pencatatan Kawin',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'IB XD010 x XG829 (Dora) - Desember 2025',
    '{"items": [{"name": "Inseminasi Buatan", "targetId": "XG829", "idPejantan": "XD010", "metoda": "inseminasi buatan", "tanggal": "2025-12-10", "inseminator": "drh. Ahmad", "kodeSemen": "STR-2025-001"}]}'::jsonb,
    '2025-12-10 14:00:00+07', 'approved', '2025-12-10 16:00:00+07', 'Admin', NULL
),
(
    'ba000005-0000-0000-0000-000000000004',
    'SUB-KAWIN-004',
    'Pencatatan Kawin', 'Pencatatan Kawin',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Perkawinan alami D177 x XG875 (Reni) - Desember 2025',
    '{"items": [{"name": "Perkawinan Alami", "targetId": "XG875", "idPejantan": "D177", "metoda": "alami", "tanggal": "2025-12-05"}]}'::jsonb,
    '2025-12-05 09:00:00+07', 'approved', '2025-12-05 11:00:00+07', 'Admin', NULL
),

-- ============================================================
-- KATEGORI: Pencatatan Melahirkan
-- ============================================================
(
    'ba000006-0000-0000-0000-000000000001',
    'SUB-LAHIR-001',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG827 (Rina) - kembar 2 ekor - Mar 2026',
    '{"items": [{"name": "Lahir Normal", "targetId": "XG827", "jumlahAnak": "2", "kandangAnak": "K-ANAKAN-01", "genderAnak": "campuran", "beratLahir": "3.1", "namaAnak": "Kembar-Rina-1", "sheepCode": "XD-K01", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-03-08 06:30:00+07', 'approved', '2026-03-08 08:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000002',
    'SUB-LAHIR-002',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG858 (Bonita) - 1 ekor betina - Mar 2026',
    '{"items": [{"name": "Lahir Normal", "targetId": "XG858", "jumlahAnak": "1", "kandangAnak": "K-ANAKAN-01", "genderAnak": "betina", "beratLahir": "3.0", "namaAnak": "Anisa", "sheepCode": "XD-K02", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-03-15 05:15:00+07', 'approved', '2026-03-15 07:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000003',
    'SUB-LAHIR-003',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG859 (Shafa) - 1 ekor jantan - Apr 2026',
    '{"items": [{"name": "Lahir Normal", "targetId": "XG859", "jumlahAnak": "1", "kandangAnak": "K-ANAKAN-01", "genderAnak": "jantan", "beratLahir": "3.5", "namaAnak": "Ganteng", "sheepCode": "XD-K03", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-04-12 04:45:00+07', 'approved', '2026-04-12 07:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000004',
    'SUB-LAHIR-004',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG875 (Reni) - 1 ekor betina - Mei 2026',
    '{"items": [{"name": "Lahir Normal", "targetId": "XG875", "jumlahAnak": "1", "kandangAnak": "K-ANAKAN-01", "genderAnak": "betina", "beratLahir": "2.8", "namaAnak": "Mungil", "sheepCode": "XD-K04", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-05-10 06:20:00+07', 'approved', '2026-05-10 08:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000005',
    'SUB-LAHIR-005',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG840 (Nita) - kembar 2 jantan - Mei 2026',
    '{"items": [{"name": "Kembar", "targetId": "XG840", "jumlahAnak": "2", "kandangAnak": "K-ANAKAN-01", "genderAnak": "jantan", "beratLahir": "3.1", "namaAnak": "Kembar-Nita", "sheepCode": "XD-K05", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-05-22 05:30:00+07', 'approved', '2026-05-22 08:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000006',
    'SUB-LAHIR-006',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG855 (Yuni) - 1 ekor betina - Jun 2026',
    '{"items": [{"name": "Lahir Normal", "targetId": "XG855", "jumlahAnak": "1", "kandangAnak": "K-ANAKAN-01", "genderAnak": "betina", "beratLahir": "3.1", "namaAnak": "Cantik", "sheepCode": "XD-K06", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-06-08 06:10:00+07', 'approved', '2026-06-08 08:00:00+07', 'Admin', NULL
),
(
    'ba000006-0000-0000-0000-000000000007',
    'SUB-LAHIR-007',
    'Pencatatan Melahirkan', 'Pencatatan Melahirkan',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Kelahiran XG842 (Susi) - kembar campuran - Jun 2026',
    '{"items": [{"name": "Kembar", "targetId": "XG842", "jumlahAnak": "2", "kandangAnak": "K-ANAKAN-01", "genderAnak": "campuran", "beratLahir": "3.2", "namaAnak": "Kembar-Susi", "sheepCode": "XD-K07", "kondisiInduk": "Sehat", "kondisiAnak": "sehat"}]}'::jsonb,
    '2026-06-18 04:55:00+07', 'approved', '2026-06-18 07:00:00+07', 'Admin', NULL
),

-- ============================================================
-- KATEGORI: Pencatatan Kotoran
-- ============================================================
(
    'ba000007-0000-0000-0000-000000000001',
    'SUB-KOTORAN-001',
    'Pencatatan Kotoran', 'Pencatatan Kotoran',
    'OP-SAMSUL', 'Samsul',
    'K-ANAKAN-01', 'kandang',
    'Pengumpulan kotoran kandang anakan - 35 kg - Jul 2026',
    '{"items": [{"name": "Pengumpulan Kotoran", "targetId": "K-ANAKAN-01", "qty": "35", "unit": "kg", "pemanfaatan": "Pupuk Organik Kebun Alpukat"}]}'::jsonb,
    NOW() - INTERVAL '5 hours', 'approved', NOW() - INTERVAL '4 hours', 'Admin', NULL
),
(
    'ba000007-0000-0000-0000-000000000002',
    'SUB-KOTORAN-002',
    'Pencatatan Kotoran', 'Pencatatan Kotoran',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'kandang',
    'Pengumpulan kotoran kandang indukan - 48 kg - Jul 2026',
    '{"items": [{"name": "Pengumpulan Kotoran", "targetId": "K-INDUKAN-01", "qty": "48", "unit": "kg", "pemanfaatan": "Pupuk Organik Kebun Kelengkeng"}]}'::jsonb,
    NOW() - INTERVAL '5 hours', 'approved', NOW() - INTERVAL '4 hours', 'Admin', NULL
),
(
    'ba000007-0000-0000-0000-000000000003',
    'SUB-KOTORAN-003',
    'Pencatatan Kotoran', 'Pencatatan Kotoran',
    'OP-SAMSUL', 'Samsul',
    'K-BATERAI-01', 'kandang',
    'Pengumpulan kotoran baterai 1 (D177) - 6 kg - Jul 2026',
    '{"items": [{"name": "Pengumpulan Kotoran", "targetId": "K-BATERAI-01", "qty": "6", "unit": "kg", "pemanfaatan": "Pupuk Organik Kebun"}]}'::jsonb,
    NOW() - INTERVAL '5 hours', 'approved', NOW() - INTERVAL '4 hours', 'Admin', NULL
),
(
    'ba000007-0000-0000-0000-000000000004',
    'SUB-KOTORAN-004',
    'Pencatatan Kotoran', 'Pencatatan Kotoran',
    'OP-RIAN', 'Rian',
    'K-INDUKAN-01', 'kandang',
    'Fermentasi pupuk kandang indukan - 95 kg - Jun 2026',
    '{"items": [{"name": "Fermentasi Kotoran", "targetId": "K-INDUKAN-01", "qty": "95", "unit": "kg", "pemanfaatan": "Pupuk Organik Fermentasi"}]}'::jsonb,
    '2026-06-20 10:00:00+07', 'approved', '2026-06-20 12:00:00+07', 'Admin', NULL
),
(
    'ba000007-0000-0000-0000-000000000005',
    'SUB-KOTORAN-005',
    'Pencatatan Kotoran', 'Pencatatan Kotoran',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'kandang',
    'Distribusi pupuk ke petani sekitar - 130 kg - Jun 2026',
    '{"items": [{"name": "Distribusi Kotoran", "targetId": "K-INDUKAN-01", "qty": "130", "unit": "kg", "pemanfaatan": "Dijual ke petani sekitar Rp 1.500/kg"}]}'::jsonb,
    '2026-06-28 11:00:00+07', 'approved', '2026-06-28 13:00:00+07', 'Admin', NULL
),

-- ============================================================
-- KATEGORI: Pending (belum disetujui)
-- ============================================================
(
    'ba000008-0000-0000-0000-000000000001',
    'SUB-PENDING-001',
    'Cek Birahi', 'Cek Birahi',
    'OP-SAMSUL', 'Samsul',
    'K-INDUKAN-01', 'sheep',
    'Cek birahi batch - XG858, XG859, XG882',
    '{"items": [{"name": "Cek Birahi", "targetId": "XG858", "hasilPemeriksaan": "tidak birahi", "tanggal": "2026-07-05"}, {"name": "Cek Birahi", "targetId": "XG859", "hasilPemeriksaan": "birahi", "tanggal": "2026-07-05"}, {"name": "Cek Birahi", "targetId": "XG882", "hasilPemeriksaan": "tidak birahi", "tanggal": "2026-07-05"}]}'::jsonb,
    NOW() - INTERVAL '30 minutes', 'pending', NULL, NULL, NULL
),
(
    'ba000008-0000-0000-0000-000000000002',
    'SUB-PENDING-002',
    'Pencatatan Kesehatan', 'Pencatatan Kesehatan',
    'OP-RIAN', 'Rian',
    'K-BATERAI-03', 'sheep',
    'Pemeriksaan pre-mating J-01 - kualitas sperma',
    '{"items": [{"name": "Pemeriksaan Medis", "targetId": "J-01", "tindakan": "Pemeriksaan Medis", "obat": null, "vitaminAmount": null, "kondisi": "sperma kualitas A, motilitas 75%"}]}'::jsonb,
    NOW() - INTERVAL '45 minutes', 'pending', NULL, NULL, NULL
)

ON CONFLICT (submission_code) DO UPDATE
SET type = EXCLUDED.type,
    type_label = EXCLUDED.type_label,
    operator_code = EXCLUDED.operator_code,
    operator_name = EXCLUDED.operator_name,
    cage_code = EXCLUDED.cage_code,
    scope = EXCLUDED.scope,
    summary = EXCLUDED.summary,
    payload = EXCLUDED.payload,
    submitted_at = EXCLUDED.submitted_at,
    approval_status = EXCLUDED.approval_status,
    reviewed_at = EXCLUDED.reviewed_at,
    reviewed_by = EXCLUDED.reviewed_by,
    review_note = EXCLUDED.review_note;
