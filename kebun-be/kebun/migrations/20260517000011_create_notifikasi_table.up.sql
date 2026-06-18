CREATE TABLE IF NOT EXISTS gardening.notifikasi (
    id_notifikasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    akun_id_akun UUID NOT NULL,
    jadwal_rutin_id_jadwal_rutin UUID REFERENCES gardening.jadwal_rutin(id_jadwal_rutin) ON DELETE CASCADE,
    tipe_notifikasi VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    status_notifikasi VARCHAR(50) NOT NULL,
    tanggal TIMESTAMP NOT NULL
);

