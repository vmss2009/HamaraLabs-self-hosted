/*
  Warnings:

  - The `constraints` column on the `Competition` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "constraints",
ADD COLUMN     "constraints" TEXT[];
