-- Seed Manures
INSERT INTO logistics.manures (id_sheep, activity_type, amount, unit, destination_type, notes) VALUES 
(1, 'collection', 5.50, 'kg', 'internal', 'Morning cage manure collection'),
(2, 'collection', 4.80, 'kg', 'internal', 'Morning cage manure collection'),
(4, 'collection', 2.10, 'kg', 'internal', 'Morning cage manure collection')
ON CONFLICT DO NOTHING;
