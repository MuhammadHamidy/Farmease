CREATE TABLE IF NOT EXISTS logistics.silage_fermentation_logs (
    id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_conversion UUID NOT NULL REFERENCES logistics.silage_conversions(id_conversion) ON DELETE CASCADE,
    check_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'fermentasi', -- 'fermentasi', 'siap', 'gagal'
    ph_level DECIMAL(4,2),
    temperature DECIMAL(5,2),
    physical_condition TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_silage_fermentation_logs_conversion ON logistics.silage_fermentation_logs(id_conversion);
