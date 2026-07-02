CREATE TABLE IF NOT EXISTS logistics.silage_conversions (
    id_conversion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_target_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    conversion_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    target_amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.silage_conversion_details (
    id_detail UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_conversion UUID NOT NULL REFERENCES logistics.silage_conversions(id_conversion) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_silage_conversions_target ON logistics.silage_conversions(id_target_feed);
CREATE INDEX IF NOT EXISTS idx_silage_conversion_details_conv ON logistics.silage_conversion_details(id_conversion);
