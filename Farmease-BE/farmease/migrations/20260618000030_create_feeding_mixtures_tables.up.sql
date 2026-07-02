CREATE TABLE IF NOT EXISTS logistics.feeding_mixtures (
    id_feeding_mixture UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    feeding_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.feeding_mixture_details (
    id_detail UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_feeding_mixture UUID NOT NULL REFERENCES logistics.feeding_mixtures(id_feeding_mixture) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feeding_mixtures_sheep ON logistics.feeding_mixtures(id_sheep);
CREATE INDEX IF NOT EXISTS idx_feeding_mixture_details_mixture ON logistics.feeding_mixture_details(id_feeding_mixture);
