-- Seed Weights
INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes) VALUES 
(1, '2026-05-01', 45.50, 'Initial weight registration'),
(1, '2026-05-15', 46.20, 'Regular growth check'),
(2, '2026-05-01', 38.00, 'Healthy female weight'),
(4, '2026-05-10', 25.40, 'Weaned lamb weighing')
ON CONFLICT DO NOTHING;
