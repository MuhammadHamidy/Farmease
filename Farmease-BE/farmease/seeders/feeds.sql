-- ============================================================================
-- SEEDER: module/feeds (logistics.feeds + logistics.feedings)
-- UUID valid hex: ca=feeds, cb=feedings
-- ============================================================================

-- ============================
-- FEEDS (Stok Pakan)
-- ============================
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES

-- Hijauan Segar
('ca000001-0000-0000-0000-000000000001', 'Rumput Gajah / Napier', 'kg', 1200.00, 0.00, 'hijauan', 'internal', 'Rumput Gajah (Napier) segar cacah, sumber serat utama'),
('ca000001-0000-0000-0000-000000000002', 'Rumput Lapangan', 'kg', 800.00, 0.00, 'hijauan', 'internal', 'Rumput lapangan segar campuran'),
('ca000001-0000-0000-0000-000000000003', 'Odot', 'kg', 600.00, 0.00, 'hijauan', 'internal', 'Rumput Odot (Dwarf Napier) segar berkualitas tinggi'),
('ca000001-0000-0000-0000-000000000004', 'Ketela Pohon / Singkong', 'kg', 400.00, 0.00, 'hijauan', 'internal', 'Ketela pohon segar (batang + daun)'),
('ca000001-0000-0000-0000-000000000005', 'Ilalang', 'kg', 1000.00, 0.00, 'hijauan', 'internal', 'Ilalang segar lapangan'),

-- Konsentrat / Energi
('ca000002-0000-0000-0000-000000000001', 'Bekatul Halus', 'kg', 1000.00, 1500.00, 'konsentrat', 'internal', 'Bekatul padi halus, sumber energi utama'),
('ca000002-0000-0000-0000-000000000002', 'Onggok (Singkong Kering)', 'kg', 800.00, 1200.00, 'konsentrat', 'internal', 'Onggok singkong kering, sumber energi alternatif'),
('ca000002-0000-0000-0000-000000000003', 'Jagung Pipil Giling', 'kg', 600.00, 4500.00, 'konsentrat', 'internal', 'Jagung pipil digiling kasar, sumber energi premium'),

-- Konsentrat / Protein
('ca000003-0000-0000-0000-000000000001', 'Ampas Tahu Segar', 'kg', 400.00, 500.00, 'konsentrat', 'internal', 'Ampas tahu segar, sumber protein murah'),
('ca000003-0000-0000-0000-000000000002', 'Bungkil Kelapa Sawit (BKS)', 'kg', 750.00, 2000.00, 'konsentrat', 'internal', 'Bungkil kelapa sawit, sumber protein tinggi'),
('ca000003-0000-0000-0000-000000000003', 'Bungkil Kacang Tanah', 'kg', 300.00, 3000.00, 'konsentrat', 'internal', 'Bungkil kacang tanah premium'),

-- Pellet Komersial
('ca000004-0000-0000-0000-000000000001', 'Pellet Konsentrat A', 'kg', 500.00, 6000.00, 'pellet', 'internal', 'Pellet starter berkualitas tinggi untuk pertumbuhan cepat'),
('ca000004-0000-0000-0000-000000000002', 'Pellet Indukan', 'kg', 300.00, 5500.00, 'pellet', 'internal', 'Pellet khusus indukan bunting dan menyusui'),

-- Vitamin & Mineral
('ca000005-0000-0000-0000-000000000001', 'Mineral Blok', 'buah', 50.00, 35000.00, 'vitamin', 'internal', 'Mineral blok jilat, kelengkapan mineral mikro'),
('ca000005-0000-0000-0000-000000000002', 'Garam Mineral Dirijen', 'kg', 100.00, 2000.00, 'vitamin', 'internal', 'Garam mineral campuran pakan'),
('ca000005-0000-0000-0000-000000000003', 'Premix Multivitamin', 'kg', 50.00, 80000.00, 'vitamin', 'internal', 'Premix multivitamin lengkap'),
('ca000005-0000-0000-0000-000000000004', 'Vitamin B-Complex Powder', 'kg', 30.00, 120000.00, 'vitamin', 'internal', 'Vitamin B-Complex suplemen nafsu makan'),

-- Pakan Hijau dari Kebun
('ca000006-0000-0000-0000-000000000001', 'Hijauan Daun Alpukat', 'kg', 200.00, 0.00, 'hijauan', 'internal', 'Daun alpukat segar hasil pemotongan/pruning kebun'),
('ca000006-0000-0000-0000-000000000002', 'Hijauan Daun Kelengkeng', 'kg', 300.00, 0.00, 'hijauan', 'internal', 'Daun kelengkeng segar hasil pemotongan/pruning kebun'),
('ca000006-0000-0000-0000-000000000003', 'Hijauan Rumput / Gulma', 'kg', 500.00, 0.00, 'hijauan', 'internal', 'Gulma dan rumput liar segar hasil pembersihan kebun'),

-- Pakan Olahan / Silase
('ca000007-0000-0000-0000-000000000001', 'Silase Daun Alpukat', 'kg', 450.00, 0.00, 'hijauan', 'internal', 'Silase hasil fermentasi daun alpukat kebun'),
('ca000007-0000-0000-0000-000000000002', 'Silase Daun Kelengkeng', 'kg', 380.00, 0.00, 'hijauan', 'internal', 'Silase hasil fermentasi daun kelengkeng kebun'),
('ca000007-0000-0000-0000-000000000003', 'Pakan Silase Campuran', 'kg', 600.00, 0.00, 'hijauan', 'internal', 'Pakan silase campuran lengkap siap saji')

ON CONFLICT (id_feed) DO UPDATE SET
  feed_name       = EXCLUDED.feed_name,
  unit            = EXCLUDED.unit,
  category        = EXCLUDED.category,
  source_type     = EXCLUDED.source_type,
  notes           = EXCLUDED.notes;

-- Hapus pakan lama yang tidak relevan (greenery duplikat & nama membingungkan)
DELETE FROM logistics.feeds WHERE id_feed IN (
  'ca000007-0000-0000-0000-000000000004'  -- Rumput Cacah (lama)
);

-- Hapus pakan lama dengan nama mentahan yang digantikan oleh nama baru
DELETE FROM logistics.feeds WHERE feed_name IN (
  'Daun Alpukat (Mentah)',
  'Daun Kelengkeng (Mentah)',
  'Gulma / Rumput Liar',
  'Silase Hijauan Kebun',
  'Hijauan Kebun (Segar)',
  'Rumput Cacah',
  'Silase Daun Alpukat',
  'Silase Daun Kelengkeng'
) AND id_feed NOT IN (
  'ca000006-0000-0000-0000-000000000001',
  'ca000006-0000-0000-0000-000000000002',
  'ca000006-0000-0000-0000-000000000003',
  'ca000007-0000-0000-0000-000000000001',
  'ca000007-0000-0000-0000-000000000002'
);


-- ============================
-- FEEDINGS (Riwayat Pemberian Pakan per Domba)
-- ============================
INSERT INTO logistics.feedings (id_feeding, id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES

-- === D177 / Toni (Pejantan, Baterai 1) ===
('cb000001-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 2.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000001-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555501', 'ca000002-0000-0000-0000-000000000001', '2026-06-01', 0.50, 'kg', 'Pakan pagi - Bekatul'),
('cb000001-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555501', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 2.50, 'kg', 'Pakan sore - Rumput Gajah'),
('cb000001-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555501', 'ca000003-0000-0000-0000-000000000001', '2026-06-01', 0.30, 'kg', 'Pakan sore - Ampas Tahu'),
('cb000001-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555501', 'ca000001-0000-0000-0000-000000000001', '2026-06-15', 2.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000001-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555501', 'ca000004-0000-0000-0000-000000000001', '2026-06-15', 0.40, 'kg', 'Pakan pagi - Pellet Konsentrat'),
('cb000001-0000-0000-0000-000000000007', '55555555-5555-5555-5555-555555555501', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 2.50, 'kg', 'Pakan pagi Juli'),
('cb000001-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555501', 'ca000002-0000-0000-0000-000000000001', '2026-07-01', 0.50, 'kg', 'Pakan pagi - Bekatul Juli'),

-- === XG893 / Mak Bocil (Indukan hamil) ===
('cb000002-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555502', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 3.00, 'kg', 'Pakan pagi - Rumput Gajah (bunting)'),
('cb000002-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555502', 'ca000004-0000-0000-0000-000000000002', '2026-06-01', 0.60, 'kg', 'Pakan pagi - Pellet Indukan'),
('cb000002-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555502', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 3.00, 'kg', 'Pakan sore - Rumput Gajah (bunting)'),
('cb000002-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555502', 'ca000003-0000-0000-0000-000000000001', '2026-06-01', 0.40, 'kg', 'Pakan sore - Ampas Tahu protein tambahan'),
('cb000002-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555502', 'ca000001-0000-0000-0000-000000000001', '2026-06-15', 3.00, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000002-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555502', 'ca000004-0000-0000-0000-000000000002', '2026-06-15', 0.70, 'kg', 'Pellet indukan ditambah menjelang lahir'),
('cb000002-0000-0000-0000-000000000007', '55555555-5555-5555-5555-555555555502', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 3.00, 'kg', 'Pakan pagi Juli'),
('cb000002-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555502', 'ca000004-0000-0000-0000-000000000002', '2026-07-01', 0.80, 'kg', 'Pellet indukan H-4 sebelum lahir'),

-- === XD009 / Bocil (Anak domba) ===
('cb000003-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555503', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 1.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000003-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555503', 'ca000004-0000-0000-0000-000000000001', '2026-06-01', 0.30, 'kg', 'Starter pellet untuk pertumbuhan'),
('cb000003-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555503', 'ca000001-0000-0000-0000-000000000001', '2026-06-15', 1.80, 'kg', 'Pakan pagi meningkat'),
('cb000003-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555503', 'ca000002-0000-0000-0000-000000000001', '2026-06-15', 0.25, 'kg', 'Bekatul untuk energi'),
('cb000003-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555503', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 2.00, 'kg', 'Pakan pagi Juli'),
('cb000003-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555503', 'ca000004-0000-0000-0000-000000000001', '2026-07-01', 0.35, 'kg', 'Pellet starter Juli'),

-- === XG894 / Ilina (Indukan birahi) ===
('cb000004-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555504', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 2.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000004-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555504', 'ca000002-0000-0000-0000-000000000001', '2026-06-01', 0.30, 'kg', 'Bekatul'),
('cb000004-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555504', 'ca000001-0000-0000-0000-000000000001', '2026-06-15', 2.50, 'kg', 'Pakan sore - Rumput Gajah'),
('cb000004-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555504', 'ca000003-0000-0000-0000-000000000001', '2026-06-15', 0.25, 'kg', 'Ampas Tahu'),
('cb000004-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555504', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 2.50, 'kg', 'Pakan pagi Juli - persiapan kawin'),
('cb000004-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555504', 'ca000003-0000-0000-0000-000000000002', '2026-07-01', 0.30, 'kg', 'BKS untuk kondisi reproduksi'),

-- === XG817 / Dian ===
('cb000005-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555505', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 2.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000005-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555505', 'ca000002-0000-0000-0000-000000000001', '2026-06-01', 0.30, 'kg', 'Bekatul'),
('cb000005-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555505', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 2.50, 'kg', 'Pakan pagi Juli'),
('cb000005-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555505', 'ca000002-0000-0000-0000-000000000001', '2026-07-01', 0.30, 'kg', 'Bekatul Juli'),

-- === J-01 / Pejantan J-01 (Baterai 3) ===
('cb000009-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555591', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 2.50, 'kg', 'Pakan pagi - Rumput Gajah'),
('cb000009-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555591', 'ca000004-0000-0000-0000-000000000001', '2026-06-01', 0.50, 'kg', 'Pellet konsentrat performa'),
('cb000009-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555591', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 2.50, 'kg', 'Pakan pagi Juli'),
('cb000009-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555591', 'ca000004-0000-0000-0000-000000000001', '2026-07-01', 0.50, 'kg', 'Pellet Juli'),

-- === B-01 / Indukan B-01 (hamil) ===
('cb000010-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555592', 'ca000001-0000-0000-0000-000000000001', '2026-06-01', 3.00, 'kg', 'Pakan pagi - Rumput Gajah (bunting)'),
('cb000010-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555592', 'ca000004-0000-0000-0000-000000000002', '2026-06-01', 0.70, 'kg', 'Pellet indukan bunting'),
('cb000010-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555592', 'ca000001-0000-0000-0000-000000000001', '2026-07-01', 3.00, 'kg', 'Pakan pagi H-5 sebelum lahir'),
('cb000010-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555592', 'ca000004-0000-0000-0000-000000000002', '2026-07-01', 0.80, 'kg', 'Pellet indukan ditambah menjelang lahir')

ON CONFLICT (id_feeding) DO NOTHING;
