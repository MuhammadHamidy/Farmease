-- ============================================================================
-- SEEDER: AUTH ROLES & ACCOUNTS
-- ============================================================================
-- Paswords: admin123, pemilik123, kebun123, kandang123
-- Gunakan password ini saat login (sesuaikan dengan hash di bawah)

-- Seed Roles
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'full'),
('00000000-0000-0000-0000-000000000002', 'Pemilik', 'view'),
('00000000-0000-0000-0000-000000000003', 'Operator Kebun', 'write'),
('00000000-0000-0000-0000-000000000004', 'Operator Kandang', 'write')
ON CONFLICT (id_role) DO NOTHING;

-- Seed Accounts
INSERT INTO auth.accounts (id_account, username, password, id_role) VALUES 
('11111111-1111-1111-1111-111111111101', 'admin',    '$2a$10$CA7blJsWYXC8v4AjGIX34./6w9WNQVExIoiJJDlX5QegAvmhMlVPK', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111104', 'pemilik', '$2a$10$lYYdtGR5f4J0rpzdThHUMu9ykOe/EjzeM3giHQkjXaBMu6TxgwDyy', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111105', 'operator_kebun', '$2a$10$l8.q9iwof087gG3vLhHcaujunq/raBUcHuxYDCUe6Yj4Y.ZxwlVfC', '00000000-0000-0000-0000-000000000003'),
('11111111-1111-1111-1111-111111111106', 'operator_kandang', '$2a$10$f3ho.V8aVBqwEgVve3rtE.8SUJjA2.o4WWYO96S6KkhFB8gLFqEBO', '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id_account) DO UPDATE SET password = EXCLUDED.password;
