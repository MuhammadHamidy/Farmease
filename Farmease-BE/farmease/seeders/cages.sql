-- Seed Cages
INSERT INTO master.cages (cage_code, capacity, cage_type, farm_id) VALUES
('K001', 20, 'jantan', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('K002', 20, 'betina', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('K-KAWIN-01', 10, 'campuran', '550e8400-e29b-41d4-a716-446655440001'::UUID)
ON CONFLICT (cage_code) DO NOTHING;
