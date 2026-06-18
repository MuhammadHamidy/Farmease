-- =========================================================================
-- Farmease Livestock Module - SQL Schema (Logical ERD - No Data Types)
// Optimized for direct import/copy-paste into Draw.io (Insert > SQL...)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. MASTER & AUTH TABLES
-- -------------------------------------------------------------------------

CREATE TABLE master_farms (
    id_farms PRIMARY KEY,
    code UNIQUE ,
    name ,
    location,
    description,
    created_at,
    updated_at
);

CREATE TABLE auth_roles (
    id_role PRIMARY KEY,
    role_name ,
    permissions  DEFAULT 'view',
    created_at,
    updated_at
);

CREATE TABLE auth_accounts (
    id_account PRIMARY KEY,
    username UNIQUE ,
    password ,
    operator_category ,
    id_role,
    farm_id,
    created_at,
    updated_at
);

CREATE TABLE master_cages (
    id_cage PRIMARY KEY,
    cage_code UNIQUE ,
    capacity ,
    cage_type ,
    cage_name,
    farm_id,
    created_at,
    updated_at
);

CREATE TABLE master_sheep_types (
    id_type PRIMARY KEY,
    type_name ,
    type_description,
    created_at,
    updated_at
);


-- -------------------------------------------------------------------------
-- 2. LIVESTOCK (HEWAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE livestock_sheep (
    id_sheep PRIMARY KEY,
    sheep_code UNIQUE ,
    sheep_name,
    gender ,
    date_of_birth,
    status  DEFAULT 'aktif',
    origin,
    id_cage,
    id_type,
    id_father,
    id_mother,
    created_by,
    updated_by,
    created_at,
    updated_at
);


-- -------------------------------------------------------------------------
-- 3. LOGISTICS & RECORDINGS TABLES
-- -------------------------------------------------------------------------

CREATE TABLE logistics_weights (
    id_weight PRIMARY KEY,
    weighing_date ,
    weight_kg ,
    notes,
    created_at
);

CREATE TABLE logistics_healths (
    id_health PRIMARY KEY,
    checkup_date ,
    diagnosis ,
    action,
    medicine_given,
    inspector_name,
    notes,
    created_at,
    updated_at
);

CREATE TABLE logistics_feeds (
    id_feed PRIMARY KEY,
    feed_name ,
    unit ,
    available_stock ,
    price_per_unit,
    category,
    external_source_id,
    source_type ,
    source_api_url,
    notes,
    created_at,
    updated_at
);

CREATE TABLE logistics_feedings (
    id_feeding PRIMARY KEY,
    feeding_date ,
    amount ,
    unit ,
    notes,
    created_at
);

CREATE TABLE logistics_manures (
    id_manure PRIMARY KEY,
    activity_type ,
    amount ,
    unit ,
    external_destination_id,
    destination_type ,
    notes,
    created_at
);


-- -------------------------------------------------------------------------
-- 4. BREEDING (PERKAWINAN & KELAHIRAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE breeding_matings (
    id_mating PRIMARY KEY,
    mating_date ,
    mating_method ,
    status  ,
    inbreeding_flag ,
    coefficient_of_inbreeding ,
    notes,
    created_at,
    updated_at
);

CREATE TABLE breeding_pregnancies (
    id_pregnancy PRIMARY KEY,
    pregnancy_date ,
    pregnancy_status  ,
    expected_birth_date,
    notes,
    created_at,
    updated_at
);

CREATE TABLE breeding_births (
    id_birth PRIMARY KEY,
    birth_date ,
    number_of_offspring ,
    offspring_gender,
    offspring_condition,
    notes,
    created_at
);


-- -------------------------------------------------------------------------
-- 5. OPERATIONS (TUGAS & PENJADWALAN) TABLES
-- -------------------------------------------------------------------------

CREATE TABLE operations_routine_schedules (
    id PRIMARY KEY,
    title ,
    description,
    category,
    frequency ,
    days_of_week,
    day_of_month,
    start_date ,
    end_date,
    start_time,
    end_time,
    priority ,
    id_cage,
    id_account,
    rincian,
    is_active ,
    created_at,
    updated_at
);

CREATE TABLE operations_tasks (
    id_task PRIMARY KEY,
    title ,
    description,
    task_date,
    status ,
    priority ,
    id_account,
    category,
    end_time ,
    schedule_id,
    id_cage,
    start_time,
    rincian,
    created_at,
    updated_at
);

CREATE TABLE operations_notifications (
    id_notification PRIMARY KEY ,
    title,
    message ,
    is_read ,
    id_account ,
    type,
    task_id,
    submission_id,
    created_at
);

CREATE TABLE operations_pencatatan_submissions (
    id_submissions PRIMARY KEY ,
    type ,
    type_label ,
    operator_code ,
    operator_name ,
    cage_code ,
    scope ,
    summary ,
    payload ,
    submitted_at,
    approval_status  ,
    reviewed_at,
    reviewed_by,
    review_note,
    task_id,
    created_at,
    updated_at
);


-- -------------------------------------------------------------------------
-- 6. RELATIONSHIPS (FOREIGN KEYS)
-- -------------------------------------------------------------------------

-- Auth & Master
ALTER TABLE auth_accounts ADD CONSTRAINT fk_accounts_role FOREIGN KEY (id_role) REFERENCES auth_roles(id_role) ON DELETE SET NULL;
ALTER TABLE auth_accounts ADD CONSTRAINT fk_accounts_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

ALTER TABLE master_cages ADD CONSTRAINT fk_cages_farm FOREIGN KEY (farm_id) REFERENCES master_farms(id) ON DELETE CASCADE;

-- Livestock
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_type FOREIGN KEY (id_type) REFERENCES master_sheep_types(id_type) ON DELETE RESTRICT;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_father FOREIGN KEY (id_father) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_mother FOREIGN KEY (id_mother) REFERENCES livestock_sheep(id_sheep) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_creator FOREIGN KEY (created_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;
ALTER TABLE livestock_sheep ADD CONSTRAINT fk_sheep_updater FOREIGN KEY (updated_by) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

-- Logistics
ALTER TABLE logistics_weights ADD CONSTRAINT fk_weights_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_healths ADD CONSTRAINT fk_healths_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feedings_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE logistics_feedings ADD CONSTRAINT fk_feedings_feed FOREIGN KEY (id_feed) REFERENCES logistics_feeds(id_feed) ON DELETE CASCADE;
ALTER TABLE logistics_manures ADD CONSTRAINT fk_manures_sheep FOREIGN KEY (id_sheep) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;

-- Breeding
ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_male FOREIGN KEY (id_sheep_male) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_matings ADD CONSTRAINT fk_matings_female FOREIGN KEY (id_sheep_female) REFERENCES livestock_sheep(id_sheep) ON DELETE CASCADE;
ALTER TABLE breeding_pregnancies ADD CONSTRAINT fk_pregnancies_mating FOREIGN KEY (id_mating) REFERENCES breeding_matings(id_mating) ON DELETE CASCADE;
ALTER TABLE breeding_births ADD CONSTRAINT fk_births_pregnancy FOREIGN KEY (id_pregnancy) REFERENCES breeding_pregnancies(id_pregnancy) ON DELETE CASCADE;

-- Operations
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;
ALTER TABLE operations_routine_schedules ADD CONSTRAINT fk_schedules_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE SET NULL;

ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_schedule FOREIGN KEY (schedule_id) REFERENCES operations_routine_schedules(id) ON DELETE SET NULL;
ALTER TABLE operations_tasks ADD CONSTRAINT fk_tasks_cage FOREIGN KEY (id_cage) REFERENCES master_cages(id_cage) ON DELETE SET NULL;

ALTER TABLE operations_notifications ADD CONSTRAINT fk_notifications_account FOREIGN KEY (id_account) REFERENCES auth_accounts(id_account) ON DELETE CASCADE;
ALTER TABLE operations_notifications ADD CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES operations_tasks(id_task) ON DELETE SET NULL;
ALTER TABLE operations_notifications ADD CONSTRAINT fk_notifications_submission FOREIGN KEY (submission_id) REFERENCES operations_pencatatan_submissions(id) ON DELETE SET NULL;

ALTER TABLE operations_pencatatan_submissions ADD CONSTRAINT fk_submissions_task FOREIGN KEY (task_id) REFERENCES operations_tasks(id_task) ON DELETE SET NULL;
