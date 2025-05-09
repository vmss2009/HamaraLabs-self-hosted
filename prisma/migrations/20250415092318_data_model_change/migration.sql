/*
  Warnings:

  - You are about to drop the column `user_id` on the `CustomisedTinkeringActivity` table. All the data in the column will be lost.
  - Added the required column `student_id` to the `CustomisedTinkeringActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomisedTinkeringActivity" DROP CONSTRAINT "CustomisedTinkeringActivity_user_id_fkey";

-- AlterTable
ALTER TABLE "CustomisedTinkeringActivity" DROP COLUMN "user_id",
ADD COLUMN     "student_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
