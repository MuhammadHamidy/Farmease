CREATE TYPE "enum_gender" AS ENUM (
	'jantan',
	'betina'
);

CREATE TYPE "enum_sheep_status" AS ENUM (
	'aktif',
	'hamil',
	'dijual',
	'mati',
	'disembelih',
	'eksternal'
);

CREATE TYPE "enum_feed_category" AS ENUM (
	'hijauan',
	'konsentrat',
	'pellet',
	'greenery',
	'vitamin'
);

CREATE TYPE "enum_mating_method" AS ENUM (
	'alami',
	'ib'
);

CREATE TYPE "enum_mating_status" AS ENUM (
	'proses',
	'sukses',
	'gagal'
);

CREATE TYPE "enum_pregnancy_status" AS ENUM (
	'dikandung',
	'melahirkan',
	'keguguran'
);

CREATE TYPE "enum_offspring_gender" AS ENUM (
	'jantan',
	'betina',
	'campuran'
);

CREATE TYPE "enum_offspring_condition" AS ENUM (
	'sehat',
	'lemas',
	'cacat',
	'mati'
);

CREATE TYPE "enum_manure_activity" AS ENUM (
	'collection',
	'fermentation',
	'distribution'
);

CREATE TYPE "enum_manure_dest" AS ENUM (
	'internal',
	'internal_kebun',
	'external_sale'
);

CREATE TYPE "enum_task_category" AS ENUM (
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

CREATE TYPE "enum_frequency" AS ENUM (
	'sekali',
	'harian',
	'mingguan',
	'bulanan'
);

CREATE TYPE "enum_priority" AS ENUM (
	'rendah',
	'sedang',
	'tinggi'
);

CREATE TYPE "enum_task_rincian" AS ENUM (
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
	'Pemeriksaan Anak & Induk',
	'Kontrol Kebuntingan'
);

CREATE TYPE "enum_task_status" AS ENUM (
	'belum',
	'proses',
	'selesai',
	'terlambat',
	'pending',
	'done',
	'menunggu'
);

CREATE TABLE IF NOT EXISTS "master_farms" (
	"id" UUID DEFAULT gen_random_uuid(),
	"code" VARCHAR(15) NOT NULL UNIQUE,
	"name" VARCHAR(100) NOT NULL,
	"location" VARCHAR(150),
	"description" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "auth_roles" (
	"id_role" UUID DEFAULT gen_random_uuid(),
	"role_name" VARCHAR(20) NOT NULL,
	"permissions" VARCHAR(20) NOT NULL DEFAULT 'view',
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_role")
);




CREATE TABLE IF NOT EXISTS "auth_accounts" (
	"id_account" UUID DEFAULT gen_random_uuid(),
	"username" VARCHAR(50) NOT NULL UNIQUE,
	"password" VARCHAR(255) NOT NULL,
	"id_role" UUID,
	"farm_id" UUID,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_account")
);




CREATE TABLE IF NOT EXISTS "master_cages" (
	"id_cage" UUID DEFAULT gen_random_uuid(),
	"cage_code" VARCHAR(10) NOT NULL UNIQUE,
	"capacity" INTEGER NOT NULL,
	"cage_type" VARCHAR(20) NOT NULL,
	"cage_name" VARCHAR(50),
	"farm_id" UUID,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_cage")
);




CREATE TABLE IF NOT EXISTS "master_sheep_types" (
	"id_type" UUID DEFAULT gen_random_uuid(),
	"type_name" VARCHAR(50) NOT NULL,
	"type_description" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_type")
);




CREATE TABLE IF NOT EXISTS "livestock_sheep" (
	"id_sheep" UUID DEFAULT gen_random_uuid(),
	"sheep_code" VARCHAR(20) NOT NULL UNIQUE,
	"sheep_name" VARCHAR(100),
	"gender" enum_gender NOT NULL,
	"date_of_birth" DATE,
	"status" enum_sheep_status NOT NULL DEFAULT 'aktif',
	"origin" VARCHAR(50),
	"id_cage" UUID,
	"id_type" UUID,
	"id_father" UUID,
	"id_mother" UUID,
	"photo_url" VARCHAR(255),
	"created_by" UUID,
	"updated_by" UUID,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_sheep")
);

CREATE INDEX IF NOT EXISTS "idx_sheep_code" ON "livestock_sheep"("sheep_code");
CREATE INDEX IF NOT EXISTS "idx_sheep_cage" ON "livestock_sheep"("id_cage");




CREATE TABLE IF NOT EXISTS "logistics_weights" (
	"id_weight" UUID DEFAULT gen_random_uuid(),
	"id_sheep" UUID NOT NULL,
	"weighing_date" DATE NOT NULL,
	"weight_kg" DECIMAL(5,2) NOT NULL,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_weight")
);




CREATE TABLE IF NOT EXISTS "logistics_healths" (
	"id_health" UUID DEFAULT gen_random_uuid(),
	"id_sheep" UUID NOT NULL,
	"checkup_date" DATE NOT NULL,
	"diagnosis" TEXT NOT NULL,
	"action" TEXT,
	"medicine_given" TEXT,
	"inspector_name" VARCHAR(50),
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_health")
);




CREATE TABLE IF NOT EXISTS "logistics_feeds" (
	"id_feed" UUID DEFAULT gen_random_uuid(),
	"feed_name" VARCHAR(50) NOT NULL,
	"unit" VARCHAR(10) NOT NULL,
	"available_stock" DECIMAL(8,2) DEFAULT 0.00,
	"price_per_unit" DECIMAL(10,2),
	"category" enum_feed_category,
	"external_source_id" VARCHAR(50),
	"source_type" VARCHAR(20) DEFAULT 'internal',
	"source_api_url" TEXT,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_feed")
);




CREATE TABLE IF NOT EXISTS "logistics_feedings" (
	"id_feeding" UUID DEFAULT gen_random_uuid(),
	"id_sheep" UUID NOT NULL,
	"id_feed" UUID NOT NULL,
	"feeding_date" DATE NOT NULL,
	"amount" DECIMAL(8,2) NOT NULL,
	"unit" VARCHAR(10) NOT NULL,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_feeding")
);




CREATE TABLE IF NOT EXISTS "logistics_manures" (
	"id_manure" UUID DEFAULT gen_random_uuid(),
	"id_sheep" UUID NOT NULL,
	"activity_type" enum_manure_activity NOT NULL,
	"amount" DECIMAL(8,2) NOT NULL,
	"unit" VARCHAR(10) NOT NULL,
	"external_destination_id" VARCHAR(50),
	"destination_type" enum_manure_dest DEFAULT internal,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_manure")
);




CREATE TABLE IF NOT EXISTS "breeding_matings" (
	"id_mating" UUID DEFAULT gen_random_uuid(),
	"id_sheep_male" UUID NOT NULL,
	"id_sheep_female" UUID NOT NULL,
	"mating_date" DATE NOT NULL,
	"mating_method" enum_mating_method NOT NULL,
	"status" enum_mating_status NOT NULL DEFAULT 'proses',
	"inbreeding_flag" BOOLEAN DEFAULT false,
	"coefficient_of_inbreeding" DECIMAL(10,8) DEFAULT 0.0,
	"notes" TEXT,
	"straw_code" VARCHAR(100) NULL,
	"inseminator" VARCHAR(100) NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_mating")
);




CREATE TABLE IF NOT EXISTS "breeding_pregnancies" (
	"id_pregnancy" UUID DEFAULT gen_random_uuid(),
	"id_mating" UUID NOT NULL,
	"pregnancy_date" DATE NOT NULL,
	"pregnancy_status" enum_pregnancy_status NOT NULL DEFAULT dikandung,
	"expected_birth_date" DATE,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_pregnancy")
);




CREATE TABLE IF NOT EXISTS "breeding_births" (
	"id_birth" UUID DEFAULT gen_random_uuid(),
	"id_pregnancy" UUID NOT NULL,
	"birth_date" DATE NOT NULL,
	"number_of_offspring" INTEGER NOT NULL,
	"offspring_gender" enum_offspring_gender,
	"offspring_condition" enum_offspring_condition,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_birth")
);




CREATE TABLE IF NOT EXISTS "operations_routine_schedules" (
	"id" UUID DEFAULT gen_random_uuid(),
	"title" TEXT NOT NULL,
	"description" TEXT,
	"category" enum_task_category,
	"frequency" enum_frequency NOT NULL,
	"days_of_week" INTEGER[],
	"day_of_month" INTEGER,
	"start_date" DATE NOT NULL,
	"end_date" DATE,
	"start_time" TIME,
	"end_time" TIME,
	"priority" enum_priority DEFAULT 'sedang',
	"id_cage" UUID,
	"id_account" UUID,
	"rincian" enum_task_rincian,
	"is_active" BOOLEAN DEFAULT true,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);

-- Prevent duplicate active schedules: same title+category+cage+account can only exist once
CREATE UNIQUE INDEX IF NOT EXISTS "uq_routine_schedules_active"
	ON "operations_routine_schedules" ("title", "category", COALESCE("id_cage"::TEXT, ''), COALESCE("id_account"::TEXT, ''))
	WHERE "is_active" = TRUE;




CREATE TABLE IF NOT EXISTS "operations_tasks" (
	"id_task" UUID DEFAULT gen_random_uuid(),
	"title" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"task_date" TIMESTAMP WITH TIME ZONE,
	"status" enum_task_status DEFAULT 'pending',
	"priority" enum_priority DEFAULT 'sedang',
	"id_account" UUID,
	"category" enum_task_category,
	"end_time" VARCHAR(255) DEFAULT '',
	"schedule_id" UUID,
	"id_cage" UUID,
	"start_time" TIME,
	"rincian" enum_task_rincian,
	"id_mating" UUID NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_task")
);

CREATE INDEX IF NOT EXISTS "idx_tasks_id_mating" ON "operations_tasks"("id_mating");




CREATE TABLE IF NOT EXISTS "operations_pencatatan_submissions" (
	"id" VARCHAR(100),
	"type" VARCHAR(50) NOT NULL,
	"type_label" VARCHAR(100) NOT NULL,
	"operator_code" VARCHAR(100) NOT NULL,
	"operator_name" VARCHAR(255) NOT NULL,
	"cage_code" VARCHAR(50) NOT NULL,
	"scope" VARCHAR(50) NOT NULL,
	"summary" TEXT NOT NULL,
	"payload" JSONB NOT NULL,
	"submitted_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	"approval_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
	"reviewed_at" TIMESTAMP WITH TIME ZONE NULL,
	"reviewed_by" VARCHAR(255) NULL,
	"review_note" TEXT NULL,
	"task_id" UUID NULL,
	"created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);

CREATE INDEX IF NOT EXISTS "idx_pencatatan_submissions_status" ON "operations_pencatatan_submissions"("approval_status");
CREATE INDEX IF NOT EXISTS "idx_pencatatan_submissions_operator" ON "operations_pencatatan_submissions"("operator_code");




CREATE TABLE IF NOT EXISTS "operations_notifications" (
	"id_notification" UUID DEFAULT gen_random_uuid(),
	"title" VARCHAR(255),
	"message" TEXT NOT NULL,
	"is_read" BOOLEAN DEFAULT false,
	"id_account" UUID NOT NULL,
	"type" VARCHAR(50),
	"task_id" UUID NULL,
	"submission_id" VARCHAR(100) NULL,
	"created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id_notification")
);



ALTER TABLE "auth_accounts"
ADD FOREIGN KEY("id_role") REFERENCES "auth_roles"("id_role")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "auth_accounts"
ADD FOREIGN KEY("farm_id") REFERENCES "master_farms"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "master_cages"
ADD FOREIGN KEY("farm_id") REFERENCES "master_farms"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("id_cage") REFERENCES "master_cages"("id_cage")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("id_type") REFERENCES "master_sheep_types"("id_type")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("id_father") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("id_mother") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("created_by") REFERENCES "auth_accounts"("id_account")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "livestock_sheep"
ADD FOREIGN KEY("updated_by") REFERENCES "auth_accounts"("id_account")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "logistics_weights"
ADD FOREIGN KEY("id_sheep") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "logistics_healths"
ADD FOREIGN KEY("id_sheep") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "logistics_feedings"
ADD FOREIGN KEY("id_sheep") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "logistics_feedings"
ADD FOREIGN KEY("id_feed") REFERENCES "logistics_feeds"("id_feed")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "logistics_manures"
ADD FOREIGN KEY("id_sheep") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "breeding_matings"
ADD FOREIGN KEY("id_sheep_male") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "breeding_matings"
ADD FOREIGN KEY("id_sheep_female") REFERENCES "livestock_sheep"("id_sheep")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "breeding_pregnancies"
ADD FOREIGN KEY("id_mating") REFERENCES "breeding_matings"("id_mating")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "breeding_births"
ADD FOREIGN KEY("id_pregnancy") REFERENCES "breeding_pregnancies"("id_pregnancy")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "operations_routine_schedules"
ADD FOREIGN KEY("id_cage") REFERENCES "master_cages"("id_cage")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_routine_schedules"
ADD FOREIGN KEY("id_account") REFERENCES "auth_accounts"("id_account")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_tasks"
ADD FOREIGN KEY("id_account") REFERENCES "auth_accounts"("id_account")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "operations_tasks"
ADD FOREIGN KEY("schedule_id") REFERENCES "operations_routine_schedules"("id")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_tasks"
	ADD FOREIGN KEY("id_cage") REFERENCES "master_cages"("id_cage")
	ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_tasks"
	ADD FOREIGN KEY("id_mating") REFERENCES "breeding_matings"("id_mating")
	ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_pencatatan_submissions"
	ADD FOREIGN KEY("task_id") REFERENCES "operations_tasks"("id_task")
	ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_notifications"
	ADD FOREIGN KEY("id_account") REFERENCES "auth_accounts"("id_account")
	ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "operations_notifications"
	ADD FOREIGN KEY("task_id") REFERENCES "operations_tasks"("id_task")
	ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "operations_notifications"
	ADD FOREIGN KEY("submission_id") REFERENCES "operations_pencatatan_submissions"("id")
	ON UPDATE NO ACTION ON DELETE SET NULL;