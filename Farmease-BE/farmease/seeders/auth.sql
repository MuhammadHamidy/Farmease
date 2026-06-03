-- ============================================================================
-- SEEDER: AUTH ROLES & ACCOUNTS
-- ============================================================================
-- Password hash: $2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a
-- Gunakan password ini saat login (sesuaikan dengan hash di atas)

-- Seed Roles
INSERT INTO auth.roles (id_role, role_name, permissions) VALUES 
(1, 'Admin', 'full'),
(2, 'Operator', 'write')
ON CONFLICT (id_role) DO NOTHING;

-- Seed Accounts
-- username: admin    -> password: (sesuai hash bcrypt di bawah)
-- username: admin2   -> password: (sesuai hash bcrypt di bawah)
-- username: operator -> password: (sesuai hash bcrypt di bawah)
INSERT INTO auth.accounts (id_account, username, password, operator_category, id_role) VALUES 
(1, 'admin',    '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', 1),
(2, 'admin2',   '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'admin', 1),
(3, 'operator', '$2a$10$uR8O15Bv0xN54hJ/xXy82e/OQo/vF0bXm5c1.g4JkXQ6U5F08b0a', 'Operator Ternak', 2),
(4, 'pemilik', '$2a$10$8PHzzOyqJ1yZzksdkniRwu.QMB9poSW6L2bez7LAb0mf5AW7KlqIi', 'admin', 1),
(5, 'operator_kebun', '$2a$10$jKQrDmWo58TCu4gxGqNLkOOljHfjZz3LUWfMHAHI9jXvDZQ0gbLzK', 'Operator Kebun', 2),
(6, 'operator_kandang', '$2a$10$Dv.1uSogdgNSiS7DHYT9l.J1QF13E3O8IL8CyU7idNslHOuyGQIJe', 'Operator Ternak', 2),
(7, 'kebun', '$2a$10$XGPpcoBT0lR7ED6/ZemRveUceDy9jjGOlbBb2FfLMfvu6kysnShGm', 'Operator Kebun', 2),
(8, 'peternak', '$2a$10$kSiwtUNVIg1iPp6QdJ99xOuYJfBaTlL4exrut3qjVc9bMOzcYcgAe', 'Operator Ternak', 2)
ON CONFLICT (id_account) DO NOTHING;

SELECT setval('auth.accounts_id_account_seq', (SELECT MAX(id_account) FROM auth.accounts));
