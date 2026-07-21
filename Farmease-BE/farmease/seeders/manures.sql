-- ============================================================================
-- SEEDER: module/manures (livestock.manures)
-- UUID valid hex: ae=manures
-- Referensi Cage UUIDs:
--   K-ANAKAN-01  = 33333333-3333-3333-3333-333333333301
--   K-INDUKAN-01 = 33333333-3333-3333-3333-333333333302
--   K-BATERAI-01 = 33333333-3333-3333-3333-333333333303
--   K-BATERAI-02 = 33333333-3333-3333-3333-333333333304
--   K-BATERAI-03 = 33333333-3333-3333-3333-333333333305
-- ============================================================================

INSERT INTO livestock.manures (id_manure, id_sheep, id_cage, activity_type, amount, unit, destination_type, notes, created_at) VALUES

-- ============ Januari 2026 ============
('ae000101-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 45.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Jan 2026', '2026-01-10 08:00:00+07'),
('ae000101-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 68.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Jan 2026', '2026-01-10 09:00:00+07'),
('ae000101-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection',  8.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 (D177) - Jan 2026', '2026-01-10 09:30:00+07'),
('ae000101-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection',  9.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 (XD010) - Jan 2026', '2026-01-10 09:45:00+07'),
('ae000101-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection',  8.80, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 (J-01) - Jan 2026', '2026-01-10 10:00:00+07'),
('ae000101-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 42.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Jan 2026', '2026-01-25 08:00:00+07'),
('ae000101-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 70.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Jan 2026', '2026-01-25 09:00:00+07'),

-- ============ Februari 2026 ============
('ae000102-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 48.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Feb 2026', '2026-02-10 08:00:00+07'),
('ae000102-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 72.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Feb 2026', '2026-02-10 09:00:00+07'),
('ae000102-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection',  9.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Feb 2026', '2026-02-10 09:30:00+07'),
('ae000102-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection',  9.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Feb 2026', '2026-02-10 09:45:00+07'),
('ae000102-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection',  9.20, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Feb 2026', '2026-02-10 10:00:00+07'),
('ae000102-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 50.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Feb 2026', '2026-02-24 08:00:00+07'),
('ae000102-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 74.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Feb 2026', '2026-02-24 09:00:00+07'),

-- ============ Maret 2026 ============
('ae000103-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 52.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Mar 2026', '2026-03-10 08:00:00+07'),
('ae000103-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 78.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Mar 2026', '2026-03-10 09:00:00+07'),
('ae000103-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection',  9.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Mar 2026', '2026-03-10 09:30:00+07'),
('ae000103-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection', 10.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Mar 2026', '2026-03-10 09:45:00+07'),
('ae000103-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection',  9.80, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Mar 2026', '2026-03-10 10:00:00+07'),
('ae000103-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 55.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Mar 2026', '2026-03-25 08:00:00+07'),
('ae000103-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 80.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Mar 2026', '2026-03-25 09:00:00+07'),
('ae000103-0000-0000-0000-000000000008', NULL, '33333333-3333-3333-3333-333333333301', 'fermentation', 80.00, 'kg', 'internal_kebun', 'Fermentasi pupuk kandang anakan - Mar 2026', '2026-03-20 10:00:00+07'),
('ae000103-0000-0000-0000-000000000009', NULL, '33333333-3333-3333-3333-333333333302', 'fermentation', 120.00, 'kg', 'internal_kebun', 'Fermentasi pupuk kandang indukan - Mar 2026', '2026-03-20 11:00:00+07'),

-- ============ April 2026 ============
('ae000104-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 58.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Apr 2026', '2026-04-10 08:00:00+07'),
('ae000104-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 82.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Apr 2026', '2026-04-10 09:00:00+07'),
('ae000104-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection', 10.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Apr 2026', '2026-04-10 09:30:00+07'),
('ae000104-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection', 10.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Apr 2026', '2026-04-10 09:45:00+07'),
('ae000104-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection', 10.20, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Apr 2026', '2026-04-10 10:00:00+07'),
('ae000104-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 60.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Apr 2026', '2026-04-25 08:00:00+07'),
('ae000104-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 85.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Apr 2026', '2026-04-25 09:00:00+07'),
('ae000104-0000-0000-0000-000000000008', NULL, '33333333-3333-3333-3333-333333333301', 'distribution', 75.00, 'kg', 'internal_kebun', 'Distribusi pupuk ke kebun - Apr 2026', '2026-04-28 10:00:00+07'),
('ae000104-0000-0000-0000-000000000009', NULL, '33333333-3333-3333-3333-333333333302', 'distribution', 100.00, 'kg', 'internal_kebun', 'Distribusi pupuk ke kebun - Apr 2026', '2026-04-28 11:00:00+07'),

-- ============ Mei 2026 ============
('ae000105-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 62.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Mei 2026', '2026-05-10 08:00:00+07'),
('ae000105-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 88.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Mei 2026', '2026-05-10 09:00:00+07'),
('ae000105-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection', 10.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Mei 2026', '2026-05-10 09:30:00+07'),
('ae000105-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection', 11.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Mei 2026', '2026-05-10 09:45:00+07'),
('ae000105-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection', 10.80, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Mei 2026', '2026-05-10 10:00:00+07'),
('ae000105-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 64.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Mei 2026', '2026-05-25 08:00:00+07'),
('ae000105-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 90.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Mei 2026', '2026-05-25 09:00:00+07'),

-- ============ Juni 2026 ============
('ae000106-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 66.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Jun 2026', '2026-06-10 08:00:00+07'),
('ae000106-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 92.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Jun 2026', '2026-06-10 09:00:00+07'),
('ae000106-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection', 11.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Jun 2026', '2026-06-10 09:30:00+07'),
('ae000106-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection', 11.50, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Jun 2026', '2026-06-10 09:45:00+07'),
('ae000106-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection', 11.20, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Jun 2026', '2026-06-10 10:00:00+07'),
('ae000106-0000-0000-0000-000000000006', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 68.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang anakan - Jun 2026', '2026-06-25 08:00:00+07'),
('ae000106-0000-0000-0000-000000000007', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 95.00, 'kg', 'internal_kebun', 'Pengumpulan kedua kandang indukan - Jun 2026', '2026-06-25 09:00:00+07'),
('ae000106-0000-0000-0000-000000000008', NULL, '33333333-3333-3333-3333-333333333301', 'fermentation', 100.00, 'kg', 'internal_kebun', 'Fermentasi pupuk kandang anakan - Jun 2026', '2026-06-20 10:00:00+07'),
('ae000106-0000-0000-0000-000000000009', NULL, '33333333-3333-3333-3333-333333333302', 'fermentation', 150.00, 'kg', 'internal_kebun', 'Fermentasi pupuk kandang indukan - Jun 2026', '2026-06-20 11:00:00+07'),
('ae000106-0000-0000-0000-000000000010', NULL, '33333333-3333-3333-3333-333333333301', 'distribution', 90.00, 'kg', 'internal_kebun', 'Distribusi pupuk ke kebun alpukat - Jun 2026', '2026-06-28 10:00:00+07'),
('ae000106-0000-0000-0000-000000000011', NULL, '33333333-3333-3333-3333-333333333302', 'distribution', 130.00, 'kg', 'external_sale', 'Dijual ke petani sekitar - Jun 2026', '2026-06-28 11:00:00+07'),

-- ============ Juli 2026 (berjalan) ============
('ae000107-0000-0000-0000-000000000001', NULL, '33333333-3333-3333-3333-333333333301', 'collection', 35.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang anakan - Jul 2026', '2026-07-05 08:00:00+07'),
('ae000107-0000-0000-0000-000000000002', NULL, '33333333-3333-3333-3333-333333333302', 'collection', 48.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran kandang indukan - Jul 2026', '2026-07-05 09:00:00+07'),
('ae000107-0000-0000-0000-000000000003', NULL, '33333333-3333-3333-3333-333333333303', 'collection',  6.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 1 - Jul 2026', '2026-07-05 09:30:00+07'),
('ae000107-0000-0000-0000-000000000004', NULL, '33333333-3333-3333-3333-333333333304', 'collection',  6.20, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 2 - Jul 2026', '2026-07-05 09:45:00+07'),
('ae000107-0000-0000-0000-000000000005', NULL, '33333333-3333-3333-3333-333333333305', 'collection',  6.00, 'kg', 'internal_kebun', 'Pengumpulan kotoran baterai 3 - Jul 2026', '2026-07-05 10:00:00+07')

ON CONFLICT (id_manure) DO NOTHING;
