-- =========================================================================
-- Farmease Livestock Module - DDL Schema for drawDB (Opsi B)
-- Optimized for direct import into https://www.drawdb.app/
-- Compatible with PostgreSQL dialect
-- Catatan: Dalam opsi ini, ENUM menggunakan CREATE TYPE bawaan Postgres.
-- DrawDB TIDAK AKAN menampilkan ENUM sebagai blok visual terpisah.
-- Namun relasi antar TABEL sudah diperbaiki menggunakan ALTER TABLE.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. DEFINE ENUM TYPES (Atribut Statis & Tetap)
-- -------------------------------------------------------------------------

CREATE TYPE enum_operator_category AS ENUM (
    'peternakan', 
    'perkebunan', 
    'admin', 
    'pemilik'
);

CREATE TYPE enum_gender AS ENUM (
    'jantan', 
    'betina'
);

CREATE TYPE enum_sheep_status AS ENUM (
    'aktif', 
    'hamil', 
    'dijual', 
    'mati', 
    'disembelih'
);

CREATE TYPE enum_feed_category AS ENUM (
    'hijauan', 
    'konsentrat', 
    'pellet', 
    'greenery', 
    'vitamin'
);

CREATE TYPE enum_mating_method AS ENUM (
    'alami', 
    'ib'
);

CREATE TYPE enum_mating_status AS ENUM (
    'proses', 
    'sukses', 
    'gagal'
);

CREATE TYPE enum_pregnancy_status AS ENUM (
    'dikandung', 
    'melahirkan', 
    'keguguran'
);

CREATE TYPE enum_offspring_gender AS ENUM (
    'jantan', 
    'betina', 
    'campuran'
);

CREATE TYPE enum_offspring_condition AS ENUM (
    'sehat', 
    'lemas', 
    'cacat', 
    'mati'
);

CREATE TYPE enum_manure_activity AS ENUM (
    'collection', 
    'fermentation', 
    'distribution'
);

CREATE TYPE enum_manure_dest AS ENUM (
    'internal', 
    'internal_kebun', 
    'external_sale'
);

CREATE TYPE enum_task_category AS ENUM (
    'pakan', 
    'kesehatan', 
    'kotoran', 
    'perkawinan', 
    'kelahiran', 
    'penyiraman', 
    'pemupukan', 
    'pembersihan', 
    'pemangkasan', 
    'panen', 
    'weighing', 
    'maintenance', 
    'admin', 
    'umum'
);

CREATE TYPE enum_frequency AS ENUM (
    'sekali', 
    'harian', 
    'mingguan', 
    'bulanan'
);

CREATE TYPE enum_priority AS ENUM (
    'rendah', 
    'sedang', 
    'tinggi'
);

CREATE TYPE enum_task_rincian AS ENUM (
    'Pakan Pagi', 
    'Pakan Sore', 
    'Konversi Pakan', 
    'Pemberian Obat', 
    'Pemberian Vitamin', 
    'Vaksinasi', 
    'Pemeriksaan Medis', 
    'Pembersihan Kandang', 
    'Fermentasi Kotoran', 
    'Kawin Alami', 
    'Inseminasi Buatan', 
    'Pencatatan Kelahiran', 
    'Pemeriksaan Anak & Induk'
);

CREATE TYPE enum_task_status AS ENUM (
    'belum', 
    'proses', 
    'selesai', 
    'terlambat', 
    'pending', 
    'done', 
    'menunggu'
);


-- -------------------------------------------------------------------------
-- 2. CREATE MASTER & AUTH TABLES
-- -------------------------------------------------------------------------

CREATE TABLE master_farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_roles (
    id_role UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(20) NOT NULL,
    permissions VARCHAR(20) NOT NULL DEFAULT 'view',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_accounts (
    id_account UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    operator_category enum_operator_category NOT NULL,
    id_role UUID,
    farm_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_cages (
    id_cage UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cage_code VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    cage_type VARCHAR(20) NOT NULL,
    cage_name VARCHAR(50),
    farm_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_sheep_types (
    id_type UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) NOT NULL,
    type_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- -------------------------------------------------------------------------
-- 3. CREATE LIVESTOCK (HEWAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE livestock_sheep (
    id_sheep UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheep_code VARCHAR(15) UNIQUE NOT NULL,
    sheep_name VARCHAR(50),
    gender enum_gender NOT NULL,
    date_of_birth DATE,
    status enum_sheep_status NOT NULL DEFAULT 'aktif',
    origin VARCHAR(30),
    id_cage UUID,
    id_type UUID,
    id_father UUID,
    id_mother UUID,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- -------------------------------------------------------------------------
-- 4. CREATE LOGISTICS & RECORDINGS TABLES
-- -------------------------------------------------------------------------

CREATE TABLE logistics_weights (
    id_weight UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL,
    weighing_date DATE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_healths (
    id_health UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL,
    checkup_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    action TEXT,
    medicine_given TEXT,
    inspector_name VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_feeds (
    id_feed UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_name VARCHAR(50) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    available_stock DECIMAL(8,2) DEFAULT 0.00,
    price_per_unit DECIMAL(10,2),
    category enum_feed_category,
    external_source_id VARCHAR(50),
    source_type VARCHAR(20) DEFAULT 'internal',
    source_api_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_feedings (
    id_feeding UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL,
    id_feed UUID NOT NULL,
    feeding_date DATE NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_manures (
    id_manure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep UUID NOT NULL,
    activity_type enum_manure_activity NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    external_destination_id VARCHAR(50),
    destination_type enum_manure_dest DEFAULT 'internal',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- -------------------------------------------------------------------------
-- 5. CREATE BREEDING (PERKAWINAN & KELAHIRAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE breeding_matings (
    id_mating UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sheep_male UUID NOT NULL,
    id_sheep_female UUID NOT NULL,
    mating_date DATE NOT NULL,
    mating_method enum_mating_method NOT NULL,
    status enum_mating_status NOT NULL DEFAULT 'proses',
    inbreeding_flag BOOLEAN DEFAULT FALSE,
    coefficient_of_inbreeding DECIMAL(10,8) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE breeding_pregnancies (
    id_pregnancy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_mating UUID NOT NULL,
    pregnancy_date DATE NOT NULL,
    pregnancy_status enum_pregnancy_status NOT NULL DEFAULT 'dikandung',
    expected_birth_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE breeding_births (
    id_birth UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pregnancy UUID NOT NULL,
    birth_date DATE NOT NULL,
    number_of_offspring INT NOT NULL,
    offspring_gender enum_offspring_gender,
    offspring_condition enum_offspring_condition,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- -------------------------------------------------------------------------
-- 6. CREATE OPERATIONS (TUGAS & PENJADWALAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE operations_routine_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category enum_task_category,
    frequency enum_frequency NOT NULL,
    days_of_week INT[], 
    day_of_month INT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    priority enum_priority DEFAULT 'sedang',
    id_cage UUID,
    id_account UUID,
    rincian enum_task_rincian,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operations_tasks (
    id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    task_date TIMESTAMP WITH TIME ZONE,
    status enum_task_status DEFAULT 'pending',
    priority enum_priority DEFAULT 'sedang',
    id_account UUID,
    category enum_task_category,
    end_time VARCHAR(50) DEFAULT '',
    schedule_id UUID,
    id_cage UUID,
    start_time TIME,
    rincian enum_task_rincian,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operations_notifications (
    id_notification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    id_account UUID NOT NULL,
    type VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 7. EXPLICIT RELATIONSHIPS (FOREIGN KEYS) - FIXED FOR DRAWDB
-- -------------------------------------------------------------------------

-- Auth & Master
ALTER TABLE auth_accounts ADD CONSTRAINT fk_acc_role FOREIGN KEY (id_role) REFERENCES auth_roles(id_role) ON DELETE SET NULL;
ALTER TABLE auth_accounts ADD CONSTRAINT fk_acc_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

ALTER TABLE master_cages ADD CONSTRAINT fk_cages_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

-- Livestock Sheep
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_type FOREIGN KEY (id_type) REFERENCES master_sheep_types(id_type) ON DELETE RESTRICT;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_father FOREIGN KEY (id_father) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_mother FOREIGN KEY (id_mother) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_creator FOREIGN KEY (created_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_updater FOREIGN KEY (updated_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

-- Logistics
ALTER TABLE logistics_weights ADD CONSTRAINT fk_weight_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_healths ADD CONSTRAINT fk_health_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feeding_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feeding_feed FOREIGN KEY (id_feed) REFERENCES logistics_feeds(id_feed) ON DELETE CASCADE;
ALTER TABLE logistics_manures ADD CONSTRAINT fk_manure_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;

-- Breeding
ALTER TABLE breeding_matings ADD CONSTRAINT fk_mating_male FOREIGN KEY (id_sheep_male) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_matings ADD CONSTRAINT fk_mating_female FOREIGN KEY (id_sheep_female) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_pregnancies ADD CONSTRAINT fk_preg_mating FOREIGN KEY (id_mating) REFERENCES breeding_matings(id_mating) ON DELETE CASCADE;
ALTER TABLE breeding_births ADD CONSTRAINT fk_birth_preg FOREIGN KEY (id_pregnancy) REFERENCES breeding_pregnancies(id_pregnancy) ON DELETE CASCADE;

-- Operations
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_sched_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_sched_acc FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

ALTER TABLE operations_tasks ADD CONSTRAINT fk_task_acc FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_task_sched FOREIGN KEY (schedule_id) REFERENCES operations_routine_schedules(id) ON DELETE SET NULL;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_task_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;

ALTER TABLE operations_notifications ADD CONSTRAINT fk_notif_acc FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
