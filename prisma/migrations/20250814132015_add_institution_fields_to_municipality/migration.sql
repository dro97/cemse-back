-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('MUNICIPALITY', 'NGO', 'OTHER');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'INSTRUCTOR';

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "cover_letter_file" TEXT,
ADD COLUMN     "cv_file" TEXT;

-- AlterTable
ALTER TABLE "municipalities" ADD COLUMN     "custom_type" TEXT,
ADD COLUMN     "institution_type" "InstitutionType" NOT NULL DEFAULT 'MUNICIPALITY',
ADD COLUMN     "primary_color" TEXT,
ADD COLUMN     "secondary_color" TEXT;

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "region" TEXT,
    "population" INTEGER,
    "mayor_name" TEXT,
    "mayor_email" TEXT,
    "mayor_phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "institution_username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "institution_email" TEXT NOT NULL,
    "phone" TEXT,
    "institution_type" "InstitutionType" NOT NULL,
    "custom_type" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institution_username_key" ON "institutions"("institution_username");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institution_email_key" ON "institutions"("institution_email");

-- CreateIndex
CREATE INDEX "institutions_department_idx" ON "institutions"("department");

-- CreateIndex
CREATE INDEX "institutions_is_active_idx" ON "institutions"("is_active");

-- CreateIndex
CREATE INDEX "institutions_created_by_idx" ON "institutions"("created_by");

-- CreateIndex
CREATE INDEX "institutions_institution_type_idx" ON "institutions"("institution_type");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_name_department_key" ON "institutions"("name", "department");

-- CreateIndex
CREATE INDEX "municipalities_institution_type_idx" ON "municipalities"("institution_type");

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
