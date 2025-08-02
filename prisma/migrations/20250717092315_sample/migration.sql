/*
  Warnings:

  - You are about to drop the column `organized_by` on the `Course` table. All the data in the column will be lost.
  - Added the required column `organised_by` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `SchoolVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "organized_by",
ADD COLUMN     "organised_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SchoolVisit" ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "other_poc" TEXT;
