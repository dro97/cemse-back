-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('COMPANY', 'APPLICANT');

-- CreateTable
CREATE TABLE "job_application_messages" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "job_application_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_application_messages_application_id_idx" ON "job_application_messages"("application_id");

-- CreateIndex
CREATE INDEX "job_application_messages_sender_id_idx" ON "job_application_messages"("sender_id");

-- CreateIndex
CREATE INDEX "job_application_messages_created_at_idx" ON "job_application_messages"("created_at");

-- AddForeignKey
ALTER TABLE "job_application_messages" ADD CONSTRAINT "job_application_messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
