-- Seed Farms
INSERT INTO master.farms (id, code, name, location, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'F-001', 'Farmease Central', 'Garut, Indonesia', 'Central sheep breeding and research facility')
ON CONFLICT (id) DO NOTHING;
