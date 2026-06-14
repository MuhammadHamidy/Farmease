-- Seed Health Checks
INSERT INTO livestock.healths (id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES 
('88888888-8888-8888-8888-888888888801', '44444444-4444-4444-4444-444444444401', '2026-05-02', 'Healthy - General Checkup', 'Vitamins injection', 'B-Complex', 'Dr. John Doe', 'Active breeding sire in excellent condition'),
('88888888-8888-8888-8888-888888888802', '44444444-4444-4444-4444-444444444402', '2026-05-03', 'Slight fever', 'Antibiotics and isolation', 'Penicillin', 'Dr. John Doe', 'To be monitored closely for 3 days'),
('88888888-8888-8888-8888-888888888803', '44444444-4444-4444-4444-444444444404', '2026-05-04', 'Healthy - Post-weaning check', 'Deworming', 'Albendazole', 'Dr. John Doe', 'Normal development')
ON CONFLICT (id_health) DO NOTHING;
