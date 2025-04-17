/*
  Warnings:

  - You are about to drop the column `cityId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `addressId` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `State` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Subtopic` table. All the data in the column will be lost.
  - You are about to drop the column `subtopicId` on the `TinkeringActivity` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `city_id` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state_id` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_id` to the `State` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Subtopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtopic_id` to the `TinkeringActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_cityId_fkey";

-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_addressId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Subtopic" DROP CONSTRAINT "Subtopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "TinkeringActivity" DROP CONSTRAINT "TinkeringActivity_subtopicId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_subjectId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "cityId",
ADD COLUMN     "city_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "City" DROP COLUMN "stateId",
ADD COLUMN     "state_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "addressId",
ADD COLUMN     "address_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "State" DROP COLUMN "countryId",
ADD COLUMN     "country_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "schoolId",
ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subtopic" DROP COLUMN "topicId",
ADD COLUMN     "topic_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TinkeringActivity" DROP COLUMN "subtopicId",
ADD COLUMN     "subtopic_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "subjectId",
ADD COLUMN     "subject_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TinkeringActivity" ADD CONSTRAINT "TinkeringActivity_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "Subtopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
