/*
  Warnings:

  - You are about to drop the column `cv_url` on the `job_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "cv_url",
ADD COLUMN     "cv_data" JSONB,
ADD COLUMN     "profile_image" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "address_line" TEXT,
ADD COLUMN     "city_state" TEXT,
ADD COLUMN     "extracurricular_activities" JSONB,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "projects" JSONB,
ADD COLUMN     "skills_with_level" JSONB,
ADD COLUMN     "websites" JSONB;
