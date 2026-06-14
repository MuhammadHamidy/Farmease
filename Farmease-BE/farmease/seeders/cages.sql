-- Seed Cages
INSERT INTO master.cages (id_cage, cage_code, capacity, cage_type, farm_id, cage_name) VALUES
('33333333-3333-3333-3333-333333333301', 'K001', 20, 'jantan', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang K001 (Pejantan)'),
('33333333-3333-3333-3333-333333333302', 'K002', 20, 'betina', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang K002 (Indukan)'),
('33333333-3333-3333-3333-333333333303', 'K-KAWIN-01', 10, 'campuran', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Perkawinan 1')
ON CONFLICT (cage_code) DO NOTHING;
