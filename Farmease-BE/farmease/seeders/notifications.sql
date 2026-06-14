-- Seed Notifications
INSERT INTO operations.notifications (id_notification, title, message, is_read, id_account, type) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'Welcome to Farmease', 'Your developer account has been initialized successfully.', false, '11111111-1111-1111-1111-111111111101', 'system'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'New Mating Task Assigned', 'You have been assigned to monitor a new mating process for Sheep D-010.', false, '11111111-1111-1111-1111-111111111102', 'reminder'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'Task Completed', 'The task to clean female cage K002 has been marked as complete.', true, '11111111-1111-1111-1111-111111111102', 'system')
ON CONFLICT (id_notification) DO NOTHING;
