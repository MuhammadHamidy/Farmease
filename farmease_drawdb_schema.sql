-- =========================================================================
-- Farmease Livestock Module - DDL Schema for drawDB (Opsi A)
-- Optimized for direct import into https://www.drawdb.app/
-- Dialect: PostgreSQL / Standard SQL
-- Column names renamed from 'value' (reserved keyword) to prevent parsing issues
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. DEFINE ENUM LOOKUP TABLES (Tabel Referensi Statis)
-- -------------------------------------------------------------------------

CREATE TABLE enum_gender (
    jantan VARCHAR(15) PRIMARY KEY,
    betina VARCHAR(15)
);

CREATE TABLE enum_sheep_status (
    aktif VARCHAR(20) PRIMARY KEY,
    hamil VARCHAR(20),
    dijual VARCHAR(20),
    mati VARCHAR(20),
    disembelih VARCHAR(20)
);

CREATE TABLE enum_feed_category (
    hijauan VARCHAR(30) PRIMARY KEY,
    konsentrat VARCHAR(30),
    pellet VARCHAR(30),
    greenery VARCHAR(30),
    vitamin VARCHAR(30)
);

CREATE TABLE enum_mating_method (
    alami VARCHAR(20) PRIMARY KEY,
    inseminasi_buatan VARCHAR(20)
);

CREATE TABLE enum_mating_status (
    proses VARCHAR(20) PRIMARY KEY,
    sukses VARCHAR(20),
    gagal VARCHAR(20)
);

CREATE TABLE enum_pregnancy_status (
    dikandung VARCHAR(25) PRIMARY KEY,
    melahirkan VARCHAR(25),
    keguguran VARCHAR(25)
);

CREATE TABLE enum_offspring_gender (
    jantan VARCHAR(20) PRIMARY KEY,
    betina VARCHAR(20),
    campuran VARCHAR(20)
);

CREATE TABLE enum_offspring_condition (
    sehat VARCHAR(20) PRIMARY KEY,
    lemas VARCHAR(20),
    cacat VARCHAR(20),
    mati VARCHAR(20)
);

CREATE TABLE enum_manure_activity (
    collection VARCHAR(30) PRIMARY KEY,
    fermentation VARCHAR(30),
    distribution VARCHAR(30)
);

CREATE TABLE enum_manure_dest (
    internal VARCHAR(30) PRIMARY KEY,
    internal_kebun VARCHAR(30),
    external_sale VARCHAR(30)
);

CREATE TABLE enum_task_category (
    pakan VARCHAR(30) PRIMARY KEY,
    kesehatan VARCHAR(30),
    kotoran VARCHAR(30),
    perkawinan VARCHAR(30),
    kelahiran VARCHAR(30),
    penyiraman VARCHAR(30),
    pemupukan VARCHAR(30),
    pembersihan VARCHAR(30),
    pemangkasan VARCHAR(30),
    panen VARCHAR(30),
    weighing VARCHAR(30),
    maintenance VARCHAR(30),
    admin VARCHAR(30),
    umum VARCHAR(30)
);

CREATE TABLE enum_frequency (
    sekali VARCHAR(20) PRIMARY KEY,
    harian VARCHAR(20),
    mingguan VARCHAR(20),
    bulanan VARCHAR(20)
);

CREATE TABLE enum_priority (
    rendah VARCHAR(15) PRIMARY KEY,
    sedang VARCHAR(15),
    tinggi VARCHAR(15)
);

CREATE TABLE enum_task_rincian (
    "Pakan Pagi" VARCHAR(50) PRIMARY KEY,
    "Pakan Sore" VARCHAR(50),
    "Konversi Pakan" VARCHAR(50),
    "Pemberian Obat" VARCHAR(50),
    "Pemberian Vitamin" VARCHAR(50),
    "Vaksinasi" VARCHAR(50),
    "Pemeriksaan Medis" VARCHAR(50),
    "Pembersihan Kandang" VARCHAR(50),
    "Fermentasi Kotoran" VARCHAR(50),
    "Kawin Alami" VARCHAR(50),
    "Inseminasi Buatan" VARCHAR(50),
    "Pencatatan Kelahiran" VARCHAR(50),
    "Pemeriksaan Anak & Induk" VARCHAR(50)
);

CREATE TABLE enum_task_status (
    belum VARCHAR(20) PRIMARY KEY,
    proses VARCHAR(20),
    selesai VARCHAR(20),
    terlambat VARCHAR(20),
    pending VARCHAR(20),
    done VARCHAR(20),
    menunggu VARCHAR(20)
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
    operator_category VARCHAR(30) NOT NULL,
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
    gender VARCHAR(15) NOT NULL,
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
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
    category VARCHAR(30),
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
    activity_type VARCHAR(30) NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    external_destination_id VARCHAR(50),
    destination_type VARCHAR(30) DEFAULT 'internal',
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
    mating_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'proses',
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
    pregnancy_status VARCHAR(25) NOT NULL DEFAULT 'dikandung',
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
    offspring_gender VARCHAR(20),
    offspring_condition VARCHAR(20),
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
    category VARCHAR(30),
    frequency VARCHAR(20) NOT NULL,
    days_of_week INT[], 
    day_of_month INT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    priority VARCHAR(15) DEFAULT 'sedang',
    id_cage UUID,
    id_account UUID,
    rincian VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operations_tasks (
    id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    task_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(15) DEFAULT 'sedang',
    id_account UUID,
    category VARCHAR(30),
    end_time VARCHAR(50) DEFAULT '',
    schedule_id UUID,
    id_cage UUID,
    start_time TIME,
    rincian VARCHAR(50),
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
-- 7. EXPLICIT RELATIONSHIPS (FOREIGN KEYS) - OPTIMIZED FOR DRAWDB IMPORT
-- -------------------------------------------------------------------------

-- Enums Mapping (Menghubungkan tabel referensi ke kolom tabel utama)

ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_enum_gender FOREIGN KEY (gender) REFERENCES enum_gender(jantan);
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_enum_status FOREIGN KEY (status) REFERENCES enum_sheep_status(aktif);

ALTER TABLE logistics_feeds ADD CONSTRAINT fk_feeds_enum_cat FOREIGN KEY (category) REFERENCES enum_feed_category(hijauan);

ALTER TABLE logistics_manures ADD CONSTRAINT fk_manures_enum_act FOREIGN KEY (activity_type) REFERENCES enum_manure_activity(collection);
ALTER TABLE logistics_manures ADD CONSTRAINT fk_manures_enum_dest FOREIGN KEY (destination_type) REFERENCES enum_manure_dest(internal);

ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_enum_method FOREIGN KEY (mating_method) REFERENCES enum_mating_method(alami);
ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_enum_status FOREIGN KEY (status) REFERENCES enum_mating_status(proses);

ALTER TABLE breeding_pregnancies ADD CONSTRAINT fk_pregnancies_enum_status FOREIGN KEY (pregnancy_status) REFERENCES enum_pregnancy_status(dikandung);

ALTER TABLE breeding_births ADD CONSTRAINT fk_births_enum_gender FOREIGN KEY (offspring_gender) REFERENCES enum_offspring_gender(jantan);
ALTER TABLE breeding_births ADD CONSTRAINT fk_births_enum_cond FOREIGN KEY (offspring_condition) REFERENCES enum_offspring_condition(sehat);

ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_enum_cat FOREIGN KEY (category) REFERENCES enum_task_category(pakan);
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_enum_freq FOREIGN KEY (frequency) REFERENCES enum_frequency(sekali);
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_enum_priority FOREIGN KEY (priority) REFERENCES enum_priority(rendah);
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_enum_rincian FOREIGN KEY (rincian) REFERENCES enum_task_rincian("Pakan Pagi");

ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_enum_status FOREIGN KEY (status) REFERENCES enum_task_status(belum);
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_enum_priority FOREIGN KEY (priority) REFERENCES enum_priority(rendah);
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_enum_cat FOREIGN KEY (category) REFERENCES enum_task_category(pakan);
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_enum_rincian FOREIGN KEY (rincian) REFERENCES enum_task_rincian("Pakan Pagi");

-- Master & Auth Relationships
ALTER TABLE auth_accounts ADD CONSTRAINT fk_accounts_role FOREIGN KEY (id_role) REFERENCES auth_roles(id_role) ON DELETE SET NULL;
ALTER TABLE auth_accounts ADD CONSTRAINT fk_accounts_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

ALTER TABLE master_cages ADD CONSTRAINT fk_cages_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

-- Livestock Relationships
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_type FOREIGN KEY (id_type) REFERENCES master_sheep_types(id_type) ON DELETE RESTRICT;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_father FOREIGN KEY (id_father) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_mother FOREIGN KEY (id_mother) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_creator FOREIGN KEY (created_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_updater FOREIGN KEY (updated_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

-- Weights & Healths
ALTER TABLE logistics_weights ADD CONSTRAINT fk_weights_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_healths ADD CONSTRAINT fk_healths_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;

-- Feedings
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feedings_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feedings_feed FOREIGN KEY (id_feed) REFERENCES logistics_feeds(id_feed) ON DELETE CASCADE;

-- Manures
ALTER TABLE logistics_manures ADD CONSTRAINT fk_manures_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;

-- Breeding Relationships
ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_male FOREIGN KEY (id_sheep_male) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_female FOREIGN KEY (id_sheep_female) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_pregnancies ADD CONSTRAINT fk_pregnancies_mating FOREIGN KEY (id_mating) REFERENCES breeding_matings(id_mating) ON DELETE CASCADE;
ALTER TABLE breeding_births ADD CONSTRAINT fk_births_pregnancy FOREIGN KEY (id_pregnancy) REFERENCES breeding_pregnancies(id_pregnancy) ON DELETE CASCADE;

-- Operations Relationships
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_schedule FOREIGN KEY (schedule_id) REFERENCES operations_routine_schedules(id) ON DELETE SET NULL;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;

ALTER TABLE operations_notifications ADD CONSTRAINT fk_notifications_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
