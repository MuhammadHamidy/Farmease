-- Seed Cages
INSERT INTO master.cages (id_cage, cage_code, capacity, cage_type, farm_id, cage_name) VALUES
('33333333-3333-3333-3333-333333333301', 'K-ANAKAN-01', 15, 'koloni', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Anakan'),
('33333333-3333-3333-3333-333333333302', 'K-INDUKAN-01', 15, 'koloni', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Indukan'),
('33333333-3333-3333-3333-333333333303', 'K-BATERAI-A', 1, 'baterai', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Baterai A (Garut)'),
('33333333-3333-3333-3333-333333333304', 'K-BATERAI-B', 1, 'baterai', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Baterai B (Garut)')
ON CONFLICT (cage_code) DO NOTHING;
