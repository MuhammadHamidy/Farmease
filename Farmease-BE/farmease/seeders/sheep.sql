-- Seed Sheep Types
INSERT INTO master.sheep_types (type_name, type_description) VALUES 
('Garut', 'Native Garut sheep breed'),
('Texel', 'Texel meat sheep breed')
ON CONFLICT (type_name) DO NOTHING;

-- Seed Sheep (Generation 1 - Grandparents)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, created_by) VALUES 
(1, 'D-001', 'Pejantan_Alpha', 'jantan', '2020-01-01', 'aktif', 'beli', 1, 1, 1),
(2, 'D-002', 'Indukan_Alpha', 'betina', '2020-02-01', 'aktif', 'beli', 2, 1, 1),
(3, 'D-003', 'Pejantan_Beta', 'jantan', '2020-03-01', 'aktif', 'beli', 1, 1, 1)
ON CONFLICT (sheep_code) DO NOTHING;

-- Seed Sheep (Generation 2 - Parents)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_sire, id_dam, created_by) VALUES 
(4, 'D-010', 'Anak_Jantan_A', 'jantan', '2022-01-01', 'aktif', 'lokal', 1, 1, 1, 2, 1),
(5, 'D-011', 'Anak_Betina_A', 'betina', '2022-01-01', 'aktif', 'lokal', 2, 1, 1, 2, 1)
ON CONFLICT (sheep_code) DO NOTHING;

-- Seed Sheep (Generation 3 - Offspring)
INSERT INTO livestock.sheep (id_sheep, sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_sire, id_dam, created_by) VALUES 
(6, 'D-020', 'Cucu_Betina_A', 'betina', '2024-01-01', 'aktif', 'lokal', 2, 1, 4, 2, 1)
ON CONFLICT (sheep_code) DO NOTHING;

-- Adjust sequence so next serial insert doesn't clash
SELECT setval('livestock.sheep_id_sheep_seq', COALESCE((SELECT MAX(id_sheep)+1 FROM livestock.sheep), 1), false);
