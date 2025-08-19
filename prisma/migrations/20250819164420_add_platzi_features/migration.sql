-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'LINK', 'ZIP', 'OTHER');

-- AlterTable
ALTER TABLE "course_modules" ADD COLUMN     "certificate_template" TEXT,
ADD COLUMN     "has_certificate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "lesson_progress" ADD COLUMN     "last_watched_at" TIMESTAMP(3),
ADD COLUMN     "video_progress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "lesson_resources" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" INTEGER,
    "order_index" INTEGER NOT NULL,
    "is_downloadable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_certificates" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "certificate_url" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" INTEGER,
    "completed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_resources_lesson_id_idx" ON "lesson_resources"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_resources_order_index_idx" ON "lesson_resources"("order_index");

-- CreateIndex
CREATE INDEX "module_certificates_module_id_idx" ON "module_certificates"("module_id");

-- CreateIndex
CREATE INDEX "module_certificates_student_id_idx" ON "module_certificates"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "module_certificates_module_id_student_id_key" ON "module_certificates"("module_id", "student_id");

-- AddForeignKey
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_certificates" ADD CONSTRAINT "module_certificates_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_certificates" ADD CONSTRAINT "module_certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
