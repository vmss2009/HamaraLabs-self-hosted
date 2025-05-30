/*
  Warnings:

  - Made the column `address_line1` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "address_line1" SET NOT NULL;
