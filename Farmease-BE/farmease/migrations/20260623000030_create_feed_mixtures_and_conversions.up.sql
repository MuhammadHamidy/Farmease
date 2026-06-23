CREATE TABLE IF NOT EXISTS logistics.feeding_mixtures (
    id_feeding_mixture UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    feeding_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.feeding_mixture_details (
    id_detail UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_feeding_mixture UUID NOT NULL REFERENCES logistics.feeding_mixtures(id_feeding_mixture) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.silage_conversions (
    id_conversion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_target_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    conversion_date TIMESTAMP WITH TIME ZONE NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.silage_conversion_details (
    id_detail UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_conversion UUID NOT NULL REFERENCES logistics.silage_conversions(id_conversion) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
