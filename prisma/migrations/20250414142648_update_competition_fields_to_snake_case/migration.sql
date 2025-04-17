/*
  Warnings:

  - You are about to drop the column `applicationEndDate` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `applicationStartDate` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competitionEndDate` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competitionStartDate` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `organisedBy` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `referenceLinks` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `application_end_date` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_start_date` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competition_end_date` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competition_start_date` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organised_by` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "applicationEndDate",
DROP COLUMN "applicationStartDate",
DROP COLUMN "competitionEndDate",
DROP COLUMN "competitionStartDate",
DROP COLUMN "createdAt",
DROP COLUMN "organisedBy",
DROP COLUMN "referenceLinks",
DROP COLUMN "updatedAt",
ADD COLUMN     "application_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "application_start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "competition_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "competition_start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organised_by" TEXT NOT NULL,
ADD COLUMN     "reference_links" TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
