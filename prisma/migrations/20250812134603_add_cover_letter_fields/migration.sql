-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "cover_letter_content" TEXT,
ADD COLUMN     "cover_letter_recipient" JSONB,
ADD COLUMN     "cover_letter_subject" TEXT,
ADD COLUMN     "cover_letter_template" TEXT DEFAULT 'professional';
