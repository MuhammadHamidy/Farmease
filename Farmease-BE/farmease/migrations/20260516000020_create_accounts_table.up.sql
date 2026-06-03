CREATE TABLE IF NOT EXISTS auth.accounts (
    id_account SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255),
    operator_category VARCHAR(20) NOT NULL,
    id_role INT REFERENCES auth.roles(id_role),
    farm_id UUID REFERENCES master.farms(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
