CREATE TABLE IF NOT EXISTS gardening.akun_lahan (
    id_akun_lahan SERIAL PRIMARY KEY,
    tanggal_tanam TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    Lahan_id_lahan INT REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Akun_id_akun INT REFERENCES auth.accounts(id_account) ON DELETE CASCADE
);

