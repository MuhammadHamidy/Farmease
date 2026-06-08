-- Seed Tasks
INSERT INTO operations.tasks (title, description, task_date, status, priority, id_account, category) VALUES 
('Pakan Pagi', 'Memberikan pakan konsentrat dan rumput', '2026-06-06 08:00:00+00', 'belum', 'tinggi', 3, 'pakan'),
('Cek Kesehatan', 'Cek kesehatan domba dan pemberian vitamin', '2026-06-06 10:00:00+00', 'proses', 'sedang', 3, 'kesehatan'),
('Pembersihan Kohe', 'Membersihkan kotoran di Kandang B', '2026-06-06 15:00:00+00', 'belum', 'rendah', 3, 'kotoran'),
('Penyiraman Lahan Alpukat', 'Menyiram lahan alpukat di LH-001', '2026-06-06 07:00:00+00', 'belum', 'tinggi', 5, 'penyiraman'),
('Pemupukan Lahan Kelengkeng', 'Memberikan pupuk kandang di LH-002', '2026-06-06 09:00:00+00', 'proses', 'sedang', 5, 'pemupukan'),
('Pembersihan Gulma', 'Membersihkan rumput liar di LH-003', '2026-06-06 14:00:00+00', 'belum', 'rendah', 5, 'pembersihan'),
('Admin Report', 'Compile breeding success and inbreeding reports', '2026-06-06 14:00:00+00', 'selesai', 'sedang', 1, 'umum')
ON CONFLICT DO NOTHING;
