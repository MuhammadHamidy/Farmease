-- Seed Feeds
INSERT INTO logistics.feeds (id_feed, feed_name, unit, available_stock, price_per_unit, category, source_type, notes) VALUES 
(1, 'Consantrate Pellet A', 'kg', 500.00, 7500.00, 'pellet', 'internal', 'Premium starter concentrate for rapid growth'),
(2, 'Napier Grass / Rumput Gajah', 'kg', 1200.00, 1500.00, 'greenery', 'internal', 'Fresh chopped forage greenery')
ON CONFLICT (id_feed) DO NOTHING;

-- Seed Feedings
INSERT INTO logistics.feedings (id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES 
(1, 1, '2026-05-15', 1.50, 'kg', 'Morning concentrate feed'),
(1, 2, '2026-05-15', 3.00, 'kg', 'Afternoon greenery forage feed'),
(2, 1, '2026-05-15', 1.20, 'kg', 'Standard concentrate feed'),
(4, 1, '2026-05-15', 0.80, 'kg', 'Lamb growth starter concentrate')
ON CONFLICT DO NOTHING;

-- Adjust sequence so next serial insert doesn't clash
SELECT setval('logistics.feeds_id_feed_seq', COALESCE((SELECT MAX(id_feed)+1 FROM logistics.feeds), 1), false);
