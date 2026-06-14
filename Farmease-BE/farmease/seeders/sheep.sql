-- Seed Sheep Types
INSERT INTO master.sheep_types (id_type, type_name, type_description) VALUES 
('22222222-2222-2222-2222-222222222201', 'Garut', 'Native Garut sheep breed'),
('22222222-2222-2222-2222-222222222202', 'Texel', 'Texel meat sheep breed'),
('22222222-2222-2222-2222-222222222203', 'Dorper', 'Dorper meat sheep breed'),
('22222222-2222-2222-2222-222222222204', 'Merino', 'Merino wool sheep breed'),
('22222222-2222-2222-2222-222222222205', 'F2 Dorper', 'F2 crossbreed of Dorper'),
('22222222-2222-2222-2222-222222222206', 'F2 Garut', 'F2 crossbreed of Garut')
ON CONFLICT (id_type) DO NOTHING;

-- Seed Sheep (Generation 1 - Grandparents)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, created_by) VALUES 
('44444444-4444-4444-4444-444444444401', 'D-001', 'Pejantan_Alpha', 'jantan', '2020-01-01', 'aktif', 'beli', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444402', 'D-002', 'Indukan_Alpha', 'betina', '2020-02-01', 'aktif', 'beli', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444403', 'D-003', 'Pejantan_Beta', 'jantan', '2020-03-01', 'aktif', 'beli', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;

-- Seed Sheep (Generation 2 - Parents)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, created_by) VALUES 
('44444444-4444-4444-4444-444444444404', 'D-010', 'Anak_Jantan_A', 'jantan', '2022-01-01', 'aktif', 'lokal', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101'),
('44444444-4444-4444-4444-444444444405', 'D-011', 'Anak_Betina_A', 'betina', '2022-01-01', 'aktif', 'lokal', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;

-- Seed Sheep (Generation 3 - Offspring)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, created_by) VALUES 
('44444444-4444-4444-4444-444444444406', 'D-020', 'Cucu_Betina_A', 'betina', '2024-01-01', 'aktif', 'lokal', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', '44444444-4444-4444-4444-444444444404', '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (sheep_code) DO NOTHING;
