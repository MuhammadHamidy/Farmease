CREATE TABLE IF NOT EXISTS gardening.notifikasi (
    id_notifikasi SERIAL PRIMARY KEY,
    akun_id_akun INT NOT NULL REFERENCES auth.accounts(id_account) ON DELETE CASCADE,
    pengingat_jadwal_id_pengingat_jadwal INT REFERENCES gardening.pengingat_jadwal(id_pengingat_jadwal) ON DELETE CASCADE,
    tipe_notifikasi VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    status_notifikasi VARCHAR(50) NOT NULL,
    tanggal TIMESTAMP NOT NULL
);

