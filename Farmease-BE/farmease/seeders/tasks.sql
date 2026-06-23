-- Seed Tasks
INSERT INTO operations.tasks (id_task, title, description, task_date, status, priority, id_account, category, id_cage, rincian) VALUES 
('dddddddd-dddd-dddd-dddd-dddddddd0001', 'Pakan Pagi', 'Memberikan pakan konsentrat dan rumput', CURRENT_DATE + INTERVAL '8 hours', 'belum', 'tinggi', '11111111-1111-1111-1111-111111111103', 'pakan', NULL, 'Pakan Pagi'),
('dddddddd-dddd-dddd-dddd-dddddddd0002', 'Cek Kesehatan', 'Cek kesehatan domba dan pemberian vitamin', CURRENT_DATE + INTERVAL '10 hours', 'proses', 'sedang', '11111111-1111-1111-1111-111111111103', 'kesehatan', NULL, 'Pemeriksaan Medis'),
('dddddddd-dddd-dddd-dddd-dddddddd0003', 'Pembersihan Kohe', 'Membersihkan kotoran di Kandang B', CURRENT_DATE + INTERVAL '15 hours', 'belum', 'rendah', '11111111-1111-1111-1111-111111111103', 'kotoran', NULL, 'Pembersihan Kandang'),
('dddddddd-dddd-dddd-dddd-dddddddd0004', 'Penyiraman Lahan Alpukat', 'Menyiram lahan alpukat di LH-001', CURRENT_DATE + INTERVAL '7 hours', 'belum', 'tinggi', '11111111-1111-1111-1111-111111111105', 'penyiraman', NULL, NULL),
('dddddddd-dddd-dddd-dddd-dddddddd0005', 'Pemupukan Lahan Kelengkeng', 'Memberikan pupuk kandang di LH-002', CURRENT_DATE + INTERVAL '9 hours', 'proses', 'sedang', '11111111-1111-1111-1111-111111111105', 'pemupukan', NULL, NULL),
('dddddddd-dddd-dddd-dddd-dddddddd0006', 'Pembersihan Gulma', 'Membersihkan rumput liar di LH-003', CURRENT_DATE + INTERVAL '14 hours', 'belum', 'rendah', '11111111-1111-1111-1111-111111111105', 'pembersihan', NULL, NULL),
('dddddddd-dddd-dddd-dddd-dddddddd0007', 'Admin Report', 'Compile breeding success and inbreeding reports', CURRENT_DATE + INTERVAL '14 hours', 'selesai', 'sedang', '11111111-1111-1111-1111-111111111101', 'umum', NULL, NULL),
('dddddddd-dddd-dddd-dddd-dddddddd0008', 'JADWAL VITAMIN ADE', 'APLIKASI ADE', CURRENT_DATE + INTERVAL '9 hours', 'belum', 'sedang', '11111111-1111-1111-1111-111111111103', 'kesehatan', '33333333-3333-3333-3333-333333333301', 'Pemberian Vitamin'),
('dddddddd-dddd-dddd-dddd-dddddddd0009', 'JADWAL OBAT CACING', 'APLIKASI OC', CURRENT_DATE + INTERVAL '11 hours', 'belum', 'sedang', '11111111-1111-1111-1111-111111111103', 'kesehatan', '33333333-3333-3333-3333-333333333301', 'Pemberian Obat'),
('dddddddd-dddd-dddd-dddd-dddddddd0010', 'ANTIBIOTIK K', 'APLIKASI AB x(0,1)BB', CURRENT_DATE + INTERVAL '13 hours', 'belum', 'tinggi', '11111111-1111-1111-1111-111111111103', 'kesehatan', '33333333-3333-3333-3333-333333333302', 'Pemberian Obat'),
('dddddddd-dddd-dddd-dddd-dddddddd0011', 'JADWAL VIT B12/PLEK', 'APLIKASI B12/PLEK', CURRENT_DATE + INTERVAL '15 hours', 'belum', 'sedang', '11111111-1111-1111-1111-111111111103', 'kesehatan', '33333333-3333-3333-3333-333333333302', 'Pemberian Vitamin')
ON CONFLICT (id_task) DO NOTHING;
