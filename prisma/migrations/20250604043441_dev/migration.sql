/*
  Warnings:

  - You are about to drop the column `description` on the `Cluster` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Hub` table. All the data in the column will be lost.
  - You are about to drop the column `head_school_id` on the `Hub` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Hub` table. All the data in the column will be lost.
  - You are about to drop the column `hub_id` on the `School` table. All the data in the column will be lost.
  - Added the required column `hub_school_id` to the `Hub` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Hub" DROP CONSTRAINT "Hub_head_school_id_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_hub_id_fkey";

-- AlterTable
ALTER TABLE "Cluster" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Hub" DROP COLUMN "description",
DROP COLUMN "head_school_id",
DROP COLUMN "name",
ADD COLUMN     "hub_school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "hub_id";

-- CreateTable
CREATE TABLE "_HubSpokes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HubSpokes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HubSpokes_B_index" ON "_HubSpokes"("B");

-- AddForeignKey
ALTER TABLE "Hub" ADD CONSTRAINT "Hub_hub_school_id_fkey" FOREIGN KEY ("hub_school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubSpokes" ADD CONSTRAINT "_HubSpokes_A_fkey" FOREIGN KEY ("A") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubSpokes" ADD CONSTRAINT "_HubSpokes_B_fkey" FOREIGN KEY ("B") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
