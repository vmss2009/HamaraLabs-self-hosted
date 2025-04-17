/*
  Warnings:

  - The `status` column on the `CustomisedCompetition` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `CustomisedTinkeringActivity` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CustomisedCompetition" DROP COLUMN "status",
ADD COLUMN     "status" TEXT[];

-- AlterTable
ALTER TABLE "CustomisedTinkeringActivity" DROP COLUMN "status",
ADD COLUMN     "status" TEXT[];
