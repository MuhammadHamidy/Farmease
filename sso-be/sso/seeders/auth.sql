-- ============================================================================
-- SEEDER: AUTH ROLES & ACCOUNTS
-- ============================================================================
-- Password hash: $2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a
-- Gunakan password ini saat login (sesuaikan dengan hash di atas)

-- Seed Roles
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'full'),
('00000000-0000-0000-0000-000000000002', 'Pemilik', 'view'),
('00000000-0000-0000-0000-000000000003', 'Operator Kebun', 'write'),
('00000000-0000-0000-0000-000000000004', 'Operator Kandang', 'write')
ON CONFLICT (id_role) DO NOTHING;

-- Seed Accounts
INSERT INTO auth.accounts (id_account, username, password, id_role) VALUES 
('11111111-1111-1111-1111-111111111101', 'admin',    '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111104', 'pemilik', '$2a$10$8PHzzOyqJ1yZzksdkniRwu.QMB9poSW6L2bez7LAb0mf5AW7KlqIi', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111105', 'operator_kebun', '$2a$10$jKQrDmWo58TCu4gxGqNLkOOljHfjZz3LUWfMHAHI9jXvDZQ0gbLzK', '00000000-0000-0000-0000-000000000003'),
('11111111-1111-1111-1111-111111111106', 'operator_kandang', '$2a$10$Dv.1uSogdgNSiS7DHYT9l.J1QF13E3O8IL8CyU7idNslHOuyGQIJe', '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id_account) DO NOTHING;
