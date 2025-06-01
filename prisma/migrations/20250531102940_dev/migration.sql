/*
  Warnings:

  - You are about to drop the column `correspondent` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `in_charge` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `principal` on the `School` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "School" DROP COLUMN "correspondent",
DROP COLUMN "in_charge",
DROP COLUMN "principal",
ADD COLUMN     "correspondent_id" TEXT,
ADD COLUMN     "in_charge_id" TEXT,
ADD COLUMN     "principal_id" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_in_charge_id_fkey" FOREIGN KEY ("in_charge_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_correspondent_id_fkey" FOREIGN KEY ("correspondent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
