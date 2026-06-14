-- Seed Feeds
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consantrate Pellet A', 'kg', 500.00, 7500.00, 'pellet', 'internal', 'Premium starter concentrate for rapid growth'),
('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', 'Napier Grass / Rumput Gajah', 'kg', 1200.00, 1500.00, 'greenery', 'internal', 'Fresh chopped forage greenery')
ON CONFLICT (id_feed) DO NOTHING;

-- Seed Feedings
INSERT INTO logistics.feedings (id_feeding, id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES 
('feedfeed-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444401', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.50, 'kg', 'Morning concentrate feed'),
('feedfeed-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444401', 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '2026-05-15', 3.00, 'kg', 'Afternoon greenery forage feed'),
('feedfeed-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444402', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 1.20, 'kg', 'Standard concentrate feed'),
('feedfeed-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444404', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-05-15', 0.80, 'kg', 'Lamb growth starter concentrate')
ON CONFLICT (id_feeding) DO NOTHING;
