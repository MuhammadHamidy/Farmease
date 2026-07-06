-- Seed Cages
INSERT INTO livestock.cages (id_cage, cage_code, capacity, cage_type, farm_id, cage_name) VALUES
('33333333-3333-3333-3333-333333333301', 'K-ANAKAN-01', 15, 'koloni', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Anakan'),
('33333333-3333-3333-3333-333333333302', 'K-INDUKAN-01', 15, 'koloni', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Indukan'),
('33333333-3333-3333-3333-333333333303', 'K-BATERAI-01', 1, 'baterai', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Baterai 1'),
('33333333-3333-3333-3333-333333333304', 'K-BATERAI-02', 1, 'baterai', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Baterai 2'),
('33333333-3333-3333-3333-333333333305', 'K-BATERAI-03', 1, 'baterai', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Kandang Baterai 3')
ON CONFLICT (id_cage) DO UPDATE
SET cage_name = EXCLUDED.cage_name,
    cage_code = EXCLUDED.cage_code,
    capacity = EXCLUDED.capacity,
    cage_type = EXCLUDED.cage_type;
