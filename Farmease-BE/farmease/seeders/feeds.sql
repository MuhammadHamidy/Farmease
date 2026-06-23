-- Seed Feeds (Energy, Protein, Mineral, Vitamin, and Greenery)
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consantrate Pellet A', 'kg', 500.00, 0.00, 'pellet', 'internal', 'Premium starter concentrate for rapid growth (Sumber Protein)'),
('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', 'Napier Grass / Rumput Gajah', 'kg', 1200.00, 0.00, 'hijauan', 'internal', 'Fresh chopped forage greenery (Rumput Gajah)'),

-- Hijauan yang Tersedia
('aaaaaaaa-aaaa-aaaa-aaaa-f00000000001', 'Rumput', 'kg', 1200.00, 0.00, 'hijauan', 'internal', 'Rumput segar lapangan'),
('aaaaaaaa-aaaa-aaaa-aaaa-f00000000002', 'Ketela Pohon', 'kg', 800.00, 0.00, 'hijauan', 'internal', 'Ketela pohon / singkong segar'),
('aaaaaaaa-aaaa-aaaa-aaaa-f00000000003', 'Odot', 'kg', 600.00, 0.00, 'hijauan', 'internal', 'Rumput odot super segar'),
('aaaaaaaa-aaaa-aaaa-aaaa-f00000000004', 'Ilalang', 'kg', 1000.00, 0.00, 'hijauan', 'internal', 'Ilalang segar lapangan'),

-- Energy Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-111111111111', 'Bekatul', 'kg', 1000.00, 0.00, 'konsentrat', 'internal', 'Bekatul halus (Sumber Energi)'),
('aaaaaaaa-aaaa-aaaa-aaaa-222222222222', 'Onggok', 'kg', 800.00, 0.00, 'konsentrat', 'internal', 'Onggok singkong kering (Sumber Energi)'),
('aaaaaaaa-aaaa-aaaa-aaaa-333333333333', 'Jagung', 'kg', 600.00, 0.00, 'konsentrat', 'internal', 'Jagung pipil giling (Sumber Energi)'),

-- Protein Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-444444444444', 'Ampas Tahu', 'kg', 400.00, 0.00, 'konsentrat', 'internal', 'Ampas tahu segar (Sumber Protein)'),
('aaaaaaaa-aaaa-aaaa-aaaa-555555555555', 'Bungkil Kelapa Sawit', 'kg', 750.00, 0.00, 'konsentrat', 'internal', 'Bungkil kelapa sawit (Sumber Protein)'),
('aaaaaaaa-aaaa-aaaa-aaaa-444444444445', 'Bungkil Kacang Tanah', 'kg', 500.00, 0.00, 'konsentrat', 'internal', 'Bungkil kacang tanah (Sumber Protein)'),

-- Mineral Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-666666666666', 'Mineral Blok', 'kg', 100.00, 0.00, 'vitamin', 'internal', 'Essential mineral block lick'),
('aaaaaaaa-aaaa-aaaa-aaaa-777777777777', 'Garam Dirijen', 'kg', 150.00, 0.00, 'vitamin', 'internal', 'Direct mineral feed additive'),

-- Vitamin Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-888888888888', 'Premix Multivitamin', 'kg', 50.00, 0.00, 'vitamin', 'internal', 'Complete multivitamin premix powder'),
('aaaaaaaa-aaaa-aaaa-aaaa-999999999999', 'B-Complex Powder', 'kg', 30.00, 0.00, 'vitamin', 'internal', 'Vitamin B-Complex supplement powder'),

-- Garden Raw Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa11111111', 'Daun Alpukat (Mentah)', 'kg', 100.00, 0.00, 'greenery', 'internal', 'Raw avocado leaves harvested from orchard'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa22222222', 'Daun Kelengkeng (Mentah)', 'kg', 1200.00, 0.00, 'greenery', 'internal', 'Raw longan leaves harvested from orchard'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa33333333', 'Gulma / Rumput Liar (Mentah)', 'kg', 1200.00, 0.00, 'greenery', 'internal', 'Weeds cleared from orchard'),

-- Silage and Converted Feeds
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa44444444', 'Silase Daun Alpukat', 'kg', 500.00, 0.00, 'greenery', 'internal', 'Avocado leaves silage feed'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa55555555', 'Silase Daun Kelengkeng', 'kg', 500.00, 0.00, 'greenery', 'internal', 'Longan leaves silage feed'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa66666666', 'Pakan Rumput Cacah', 'kg', 500.00, 0.00, 'greenery', 'internal', 'Chops and processed grasses mix'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaa77777777', 'Pakan Silase', 'kg', 500.00, 0.00, 'hijauan', 'internal', 'Pakan silase lengkap siap saji')
ON CONFLICT (id_feed) DO NOTHING;

-- Seed Feedings
INSERT INTO logistics.feedings (id_feeding, id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES 
('feedfeed-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.50, 'kg', 'Morning concentrate feed'),
('feedfeed-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555501', 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '2026-05-15', 3.00, 'kg', 'Afternoon greenery forage feed'),
('feedfeed-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555502', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.20, 'kg', 'Standard concentrate feed'),
('feedfeed-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555504', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 0.80, 'kg', 'Lamb growth starter concentrate')
ON CONFLICT (id_feeding) DO NOTHING;
