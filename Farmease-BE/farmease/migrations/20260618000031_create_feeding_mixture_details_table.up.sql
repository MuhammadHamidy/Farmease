CREATE TABLE IF NOT EXISTS logistics.feeding_mixture_details (
    id_detail UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_feeding_mixture UUID NOT NULL REFERENCES logistics.feeding_mixtures(id_feeding_mixture) ON DELETE CASCADE,
    id_feed UUID NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feeding_mixture_details_mixture ON logistics.feeding_mixture_details(id_feeding_mixture);
