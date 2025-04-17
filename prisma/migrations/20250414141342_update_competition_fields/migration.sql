/*
  Warnings:

  - You are about to drop the column `application_end` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `application_start` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competition_end` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competition_start` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `organised_by` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `reference_links` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `applicationEndDate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationStartDate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionEndDate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionStartDate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisedBy` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "application_end",
DROP COLUMN "application_start",
DROP COLUMN "competition_end",
DROP COLUMN "competition_start",
DROP COLUMN "created_at",
DROP COLUMN "organised_by",
DROP COLUMN "payment_type",
DROP COLUMN "reference_links",
ADD COLUMN     "applicationEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "applicationStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "competitionEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "competitionStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organisedBy" TEXT NOT NULL,
ADD COLUMN     "payment" TEXT NOT NULL,
ADD COLUMN     "referenceLinks" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
