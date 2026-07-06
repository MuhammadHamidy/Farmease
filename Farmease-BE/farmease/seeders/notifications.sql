-- ============================================================================
-- SEEDER: module/notifications (operations.notifications)
-- UUID valid hex: af=notifications
-- References: db000003=task overdue, ba000xxx=submissions
-- ============================================================================

INSERT INTO operations.notifications (
    id_notification, title, message, is_read, id_account, type, task_id, submission_id, created_at
) VALUES

-- Notifikasi HPL Alert (belum dibaca)
(
    'af000001-0000-0000-0000-000000000001',
    'Alert HPL: XG893 (Mak Bocil) - H-4',
    'Domba XG893 (Mak Bocil) diperkirakan melahirkan dalam 4 hari. Segera persiapkan kandang bersalin dan perlengkapan persalinan.',
    false, '11111111-1111-1111-1111-111111111101',
    'hpl_alert', NULL, NULL,
    NOW() - INTERVAL '1 hour'
),
(
    'af000001-0000-0000-0000-000000000002',
    'Alert HPL: B-01 (Indukan B-01) - H-5',
    'Domba B-01 diperkirakan melahirkan dalam 5 hari. Pantau kondisi indukan dan persiapkan pertolongan persalinan.',
    false, '11111111-1111-1111-1111-111111111101',
    'hpl_alert', NULL, NULL,
    NOW() - INTERVAL '1 hour'
),

-- Notifikasi pengajuan menunggu persetujuan
(
    'af000002-0000-0000-0000-000000000001',
    'Pengajuan Pencatatan Baru',
    'Operator Samsul mengajukan Cek Birahi untuk 3 domba di kandang indukan. Menunggu persetujuan Anda.',
    false, '11111111-1111-1111-1111-111111111101',
    'submission_pending', NULL, NULL,
    NOW() - INTERVAL '30 minutes'
),
(
    'af000002-0000-0000-0000-000000000002',
    'Pengajuan Pencatatan Baru',
    'Operator Rian mengajukan Pemeriksaan Kesehatan Pre-Mating untuk J-01. Menunggu persetujuan Anda.',
    false, '11111111-1111-1111-1111-111111111101',
    'submission_pending', NULL, NULL,
    NOW() - INTERVAL '45 minutes'
),

-- Notifikasi sudah dibaca (riwayat)
(
    'af000003-0000-0000-0000-000000000001',
    'Pengajuan Disetujui',
    'Pencatatan Cek Birahi XG894 (Ilina) dan XG817 (Dian) telah disetujui. Status: Birahi terkonfirmasi.',
    true, '11111111-1111-1111-1111-111111111106',
    'submission_approved', NULL, 'ba000001-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 hour'
),
(
    'af000003-0000-0000-0000-000000000002',
    'Pengajuan Disetujui',
    'Pencatatan Pakan Pagi Kandang Anakan telah disetujui.',
    true, '11111111-1111-1111-1111-111111111106',
    'submission_approved', NULL, 'ba000002-0000-0000-0000-000000000001',
    NOW() - INTERVAL '5 hours'
),
(
    'af000003-0000-0000-0000-000000000003',
    'Pengajuan Disetujui',
    'Pencatatan Kotoran Kandang Anakan dan Indukan telah disetujui.',
    true, '11111111-1111-1111-1111-111111111106',
    'submission_approved', NULL, 'ba000007-0000-0000-0000-000000000001',
    NOW() - INTERVAL '4 hours'
),

-- Notifikasi tugas terlambat
(
    'af000004-0000-0000-0000-000000000001',
    'Tugas Terlambat: Vaksinasi Kandang Anakan',
    'Tugas Vaksinasi Rutin Kandang Anakan sudah 3 hari terlambat. Segera lakukan vaksinasi untuk mencegah penyakit.',
    false, '11111111-1111-1111-1111-111111111101',
    'task_overdue', 'db000003-0000-0000-0000-000000000001', NULL,
    NOW() - INTERVAL '2 hours'
),

-- Notifikasi sistem
(
    'af000005-0000-0000-0000-000000000001',
    'Selamat Datang di FARMEase!',
    'Sistem manajemen peternakan FARMEase siap digunakan. Mulai catat aktivitas harian Anda.',
    true, '11111111-1111-1111-1111-111111111106',
    'system', NULL, NULL,
    '2026-01-01 08:00:00+07'
),
(
    'af000005-0000-0000-0000-000000000002',
    'Selamat Datang di FARMEase!',
    'Sistem manajemen peternakan FARMEase siap digunakan. Pantau dan kelola semua aktivitas peternakan di sini.',
    true, '11111111-1111-1111-1111-111111111101',
    'system', NULL, NULL,
    '2026-01-01 08:00:00+07'
)

ON CONFLICT (id_notification) DO NOTHING;
