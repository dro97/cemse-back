-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "academic_achievements" JSONB,
ADD COLUMN     "current_degree" TEXT,
ADD COLUMN     "education_history" JSONB,
ADD COLUMN     "gpa" DOUBLE PRECISION,
ADD COLUMN     "university_end_date" TIMESTAMP(3),
ADD COLUMN     "university_name" TEXT,
ADD COLUMN     "university_start_date" TIMESTAMP(3),
ADD COLUMN     "university_status" TEXT;
