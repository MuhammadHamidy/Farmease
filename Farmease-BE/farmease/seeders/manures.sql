-- Seed Manures
INSERT INTO logistics.manures (id_manure, id_sheep, activity_type, amount, unit, destination_type, notes) VALUES 
('cccccccc-cccc-cccc-cccc-cccccccc0001', '44444444-4444-4444-4444-444444444401', 'collection', 5.50, 'kg', 'internal', 'Morning cage manure collection'),
('cccccccc-cccc-cccc-cccc-cccccccc0002', '44444444-4444-4444-4444-444444444402', 'collection', 4.80, 'kg', 'internal', 'Morning cage manure collection'),
('cccccccc-cccc-cccc-cccc-cccccccc0003', '44444444-4444-4444-4444-444444444404', 'collection', 2.10, 'kg', 'internal', 'Morning cage manure collection')
ON CONFLICT (id_manure) DO NOTHING;
