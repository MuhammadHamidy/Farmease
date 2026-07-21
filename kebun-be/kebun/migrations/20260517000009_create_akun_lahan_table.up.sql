CREATE TABLE IF NOT EXISTS gardening.akun_lahan (
    id_akun_lahan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_tanam TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    Lahan_id_lahan UUID REFERENCES gardening.lahan(id_lahan) ON DELETE CASCADE,
    Akun_id_akun UUID,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
