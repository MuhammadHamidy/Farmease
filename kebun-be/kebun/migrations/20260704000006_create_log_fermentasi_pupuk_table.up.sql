CREATE TABLE IF NOT EXISTS gardening.log_fermentasi_pupuk (
    id_log                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fermentasi          UUID NOT NULL REFERENCES gardening.fermentasi_pupuk(id_fermentasi) ON DELETE CASCADE,
    tanggal_cek            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    suhu                   NUMERIC(4,1),
    kelembaban             NUMERIC(5,2),
    kondisi_fisik          TEXT,
    notes                  TEXT,
    status                 VARCHAR(50) NOT NULL,
    id_account             UUID,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
