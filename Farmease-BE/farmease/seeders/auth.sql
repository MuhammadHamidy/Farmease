-- ============================================================================
-- SEEDER: AUTH ROLES & ACCOUNTS
-- ============================================================================
-- Password hash: $2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a
-- Gunakan password ini saat login (sesuaikan dengan hash di atas)

-- Seed Roles
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'full'),
('00000000-0000-0000-0000-000000000002', 'Operator', 'write')
ON CONFLICT (id_role) DO NOTHING;

-- Seed Accounts
INSERT INTO auth.accounts (id_account, username, password, operator_category, id_role) VALUES 
('11111111-1111-1111-1111-111111111101', 'admin',    '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111102', 'admin2',   '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111103', 'operator', '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'Operator Ternak', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111104', 'pemilik', '$2a$10$8PHzzOyqJ1yZzksdkniRwu.QMB9poSW6L2bez7LAb0mf5AW7KlqIi', 'admin', '00000000-0000-0000-0000-000000000001'),
('11111111-1111-1111-1111-111111111105', 'operator_kebun', '$2a$10$jKQrDmWo58TCu4gxGqNLkOOljHfjZz3LUWfMHAHI9jXvDZQ0gbLzK', 'Operator Kebun', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111106', 'operator_kandang', '$2a$10$Dv.1uSogdgNSiS7DHYT9l.J1QF13E3O8IL8CyU7idNslHOuyGQIJe', 'Operator Ternak', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111107', 'kebun', '$2a$10$XGPpcoBT0lR7ED6/ZemRveUceDy9jjGOlbBb2FfLMfvu6kysnShGm', 'Operator Kebun', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111108', 'peternak', '$2a$10$kSiwtUNVIg1iPp6QdJ99xOuYJfBaTlL4exrut3qjVc9bMOzcYcgAe', 'Operator Ternak', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id_account) DO NOTHING;
