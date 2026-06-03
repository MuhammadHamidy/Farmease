-- Seed Tasks
INSERT INTO operations.tasks (title, description, task_date, status, id_account, category) VALUES 
('Weighing Sheep', 'Conduct bi-weekly sheep weighing for all growing lambs', '2026-05-20 09:00:00+00', 'pending', 2, 'weighing'),
('Admin Report', 'Compile breeding success and inbreeding coefficient reports', '2026-05-18 14:00:00+00', 'pending', 1, 'admin'),
('Cage Cleaning', 'Clean and sanitize female cage K002', '2026-05-15 08:00:00+00', 'pending', 2, 'maintenance')
ON CONFLICT DO NOTHING;
