-- CreateEnum
CREATE TYPE "YouthApplicationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'HIRED');

-- CreateEnum
CREATE TYPE "YouthMessageSenderType" AS ENUM ('YOUTH', 'COMPANY');

-- CreateEnum
CREATE TYPE "CompanyInterestStatus" AS ENUM ('INTERESTED', 'CONTACTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'NOT_INTERESTED');

-- CreateTable
CREATE TABLE "youth_applications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cv_file" TEXT,
    "cover_letter_file" TEXT,
    "cv_url" TEXT,
    "cover_letter_url" TEXT,
    "status" "YouthApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "youth_profile_id" TEXT NOT NULL,

    CONSTRAINT "youth_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youth_application_messages" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_type" "YouthMessageSenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "youth_application_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youth_application_company_interests" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "status" "CompanyInterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youth_application_company_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "youth_applications_youth_profile_id_idx" ON "youth_applications"("youth_profile_id");

-- CreateIndex
CREATE INDEX "youth_applications_status_idx" ON "youth_applications"("status");

-- CreateIndex
CREATE INDEX "youth_applications_is_public_idx" ON "youth_applications"("is_public");

-- CreateIndex
CREATE INDEX "youth_applications_created_at_idx" ON "youth_applications"("created_at");

-- CreateIndex
CREATE INDEX "youth_application_messages_application_id_idx" ON "youth_application_messages"("application_id");

-- CreateIndex
CREATE INDEX "youth_application_messages_sender_id_idx" ON "youth_application_messages"("sender_id");

-- CreateIndex
CREATE INDEX "youth_application_messages_created_at_idx" ON "youth_application_messages"("created_at");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_application_id_idx" ON "youth_application_company_interests"("application_id");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_company_id_idx" ON "youth_application_company_interests"("company_id");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_status_idx" ON "youth_application_company_interests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "youth_application_company_interests_application_id_company__key" ON "youth_application_company_interests"("application_id", "company_id");

-- AddForeignKey
ALTER TABLE "youth_applications" ADD CONSTRAINT "youth_applications_youth_profile_id_fkey" FOREIGN KEY ("youth_profile_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youth_application_messages" ADD CONSTRAINT "youth_application_messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "youth_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "youth_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
