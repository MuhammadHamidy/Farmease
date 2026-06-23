-- Seed Health Checks
INSERT INTO livestock.healths (id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES 
('88888888-8888-8888-8888-888888888801', '55555555-5555-5555-5555-555555555501', '2026-06-01', 'Vaksin Enterotoxemia', 'Vaksinasi', 'Clostridium Vaccine', 'Dr. John Doe', 'Pemberian vaksin Enterotoxemia dosis pertama'),
('88888888-8888-8888-8888-888888888802', '55555555-5555-5555-5555-555555555502', '2026-06-02', 'Vitamin', 'Aplikasi ADE', 'Vitamin ADE', 'Dr. John Doe', 'Injeksi vitamin ADE untuk menjaga daya tahan tubuh'),
('88888888-8888-8888-8888-888888888803', '55555555-5555-5555-5555-555555555503', '2026-06-03', 'Obat Cacing', 'Aplikasi OC', 'Albendazole', 'Dr. John Doe', 'Pemberian obat cacing berkala'),
('88888888-8888-8888-8888-888888888804', '55555555-5555-5555-5555-555555555504', '2026-06-04', 'Antibiotik', 'Aplikasi AB x(0,1)BB', 'Antibiotik K', 'Dr. John Doe', 'Pemberian antibiotik pengobatan'),
('88888888-8888-8888-8888-888888888805', '55555555-5555-5555-5555-555555555505', '2026-06-05', 'Vitamin', 'Pemberian Vit B-Complex', 'Vit B-Complex', 'Dr. John Doe', 'Pemberian vitamin B-Complex untuk nafsu makan'),
('88888888-8888-8888-8888-888888888806', '55555555-5555-5555-5555-555555555506', '2026-06-06', 'Vitamin', 'Aplikasi B12/PLEK', 'Vitamin B12/PLEK', 'Dr. John Doe', 'Injeksi vitamin B12/PLEK')
ON CONFLICT (id_health) DO NOTHING;
