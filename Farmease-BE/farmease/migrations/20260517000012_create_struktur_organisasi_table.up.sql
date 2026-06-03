CREATE TABLE IF NOT EXISTS gardening.struktur_organisasi (
    id_struktur_organisasi SERIAL PRIMARY KEY,
    Akun_id_akun INT NOT NULL REFERENCES auth.accounts(id_account) ON DELETE CASCADE,
    jabatan VARCHAR(255) NOT NULL
);
