CREATE TABLE IF NOT EXISTS gardening.notifikasi (
    id_notifikasi SERIAL PRIMARY KEY,
    akun_id_akun INT NOT NULL REFERENCES auth.accounts(id_account) ON DELETE CASCADE,
    jadwal_rutin_id_jadwal_rutin INT REFERENCES gardening.jadwal_rutin(id_jadwal_rutin) ON DELETE CASCADE,
    tipe_notifikasi VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    status_notifikasi VARCHAR(50) NOT NULL,
    tanggal TIMESTAMP NOT NULL
);

