-- Seed Notifications
INSERT INTO operations.notifications (title, message, is_read, id_account, type) VALUES 
('Welcome to Farmease', 'Your developer account has been initialized successfully.', false, 1, 'system'),
('New Mating Task Assigned', 'You have been assigned to monitor a new mating process for Sheep D-010.', false, 2, 'reminder'),
('Task Completed', 'The task to clean female cage K002 has been marked as complete.', true, 2, 'system')
ON CONFLICT DO NOTHING;
