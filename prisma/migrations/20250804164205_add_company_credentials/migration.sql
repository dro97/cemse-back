/*
  Warnings:

  - A unique constraint covering the columns `[company_username]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_login_email]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_username]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_login_email]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_login_email` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_username` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "company_login_email" TEXT NOT NULL,
ADD COLUMN     "company_username" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_username_key" ON "companies"("company_username");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_login_email_key" ON "companies"("company_login_email");

-- CreateIndex
CREATE UNIQUE INDEX "company_username_unique" ON "companies"("company_username");

-- CreateIndex
CREATE UNIQUE INDEX "company_login_email_unique" ON "companies"("company_login_email");
