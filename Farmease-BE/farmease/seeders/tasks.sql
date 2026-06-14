-- Seed Tasks
INSERT INTO operations.tasks (id_task, title, description, task_date, status, priority, id_account, category) VALUES 
('dddddddd-dddd-dddd-dddd-dddddddd0001', 'Pakan Pagi', 'Memberikan pakan konsentrat dan rumput', '2026-06-06 08:00:00+00', 'belum', 'tinggi', '11111111-1111-1111-1111-111111111103', 'pakan'),
('dddddddd-dddd-dddd-dddd-dddddddd0002', 'Cek Kesehatan', 'Cek kesehatan domba dan pemberian vitamin', '2026-06-06 10:00:00+00', 'proses', 'sedang', '11111111-1111-1111-1111-111111111103', 'kesehatan'),
('dddddddd-dddd-dddd-dddd-dddddddd0003', 'Pembersihan Kohe', 'Membersihkan kotoran di Kandang B', '2026-06-06 15:00:00+00', 'belum', 'rendah', '11111111-1111-1111-1111-111111111103', 'kotoran'),
('dddddddd-dddd-dddd-dddd-dddddddd0004', 'Penyiraman Lahan Alpukat', 'Menyiram lahan alpukat di LH-001', '2026-06-06 07:00:00+00', 'belum', 'tinggi', '11111111-1111-1111-1111-111111111105', 'penyiraman'),
('dddddddd-dddd-dddd-dddd-dddddddd0005', 'Pemupukan Lahan Kelengkeng', 'Memberikan pupuk kandang di LH-002', '2026-06-06 09:00:00+00', 'proses', 'sedang', '11111111-1111-1111-1111-111111111105', 'pemupukan'),
('dddddddd-dddd-dddd-dddd-dddddddd0006', 'Pembersihan Gulma', 'Membersihkan rumput liar di LH-003', '2026-06-06 14:00:00+00', 'belum', 'rendah', '11111111-1111-1111-1111-111111111105', 'pembersihan'),
('dddddddd-dddd-dddd-dddd-dddddddd0007', 'Admin Report', 'Compile breeding success and inbreeding reports', '2026-06-06 14:00:00+00', 'selesai', 'sedang', '11111111-1111-1111-1111-111111111101', 'umum')
ON CONFLICT (id_task) DO NOTHING;
