CREATE SCHEMA IF NOT EXISTS logistics;

DO $$ BEGIN
    CREATE TYPE logistics.feed_category_enum AS ENUM ('hijauan', 'konsentrat', 'pellet', 'greenery', 'vitamin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS logistics.feeds (
    id_feed UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    available_stock DECIMAL(10,2) DEFAULT 0.0,
    price_per_unit DECIMAL(15,2),
    category logistics.feed_category_enum,
    external_source_id VARCHAR(100),
    source_type VARCHAR(50) DEFAULT 'internal',
    source_api_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feeds_external_source ON logistics.feeds(external_source_id);