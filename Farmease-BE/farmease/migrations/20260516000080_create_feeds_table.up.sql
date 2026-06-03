CREATE SCHEMA IF NOT EXISTS logistics;

CREATE TABLE IF NOT EXISTS logistics.feeds (
    id_feed SERIAL PRIMARY KEY,
    feed_name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    available_stock DECIMAL(10,2) DEFAULT 0.0,
    price_per_unit DECIMAL(15,2),
    category VARCHAR(20),
    external_source_id VARCHAR(100),
    source_type VARCHAR(50) DEFAULT 'internal',
    source_api_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logistics.feedings (
    id_feeding SERIAL PRIMARY KEY,
    id_sheep INT NOT NULL REFERENCES livestock.sheep(id_sheep) ON DELETE CASCADE,
    id_feed INT NOT NULL REFERENCES logistics.feeds(id_feed) ON DELETE CASCADE,
    feeding_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feeds_external_source ON logistics.feeds(external_source_id);