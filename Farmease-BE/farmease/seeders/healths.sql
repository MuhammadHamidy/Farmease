-- Seed Health Checks
INSERT INTO livestock.healths (id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES 
(1, '2026-05-02', 'Healthy - General Checkup', 'Vitamins injection', 'B-Complex', 'Dr. John Doe', 'Active breeding sire in excellent condition'),
(2, '2026-05-03', 'Slight fever', 'Antibiotics and isolation', 'Penicillin', 'Dr. John Doe', 'To be monitored closely for 3 days'),
(4, '2026-05-04', 'Healthy - Post-weaning check', 'Deworming', 'Albendazole', 'Dr. John Doe', 'Normal development')
ON CONFLICT DO NOTHING;
