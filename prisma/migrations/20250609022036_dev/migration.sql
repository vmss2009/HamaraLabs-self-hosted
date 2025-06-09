/*
  Warnings:

  - Added the required column `details` to the `SchoolVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SchoolVisit" ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "other_poc" TEXT;
