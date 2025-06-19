/*
  Warnings:

  - The primary key for the `Cluster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Competition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CustomisedCompetition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CustomisedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CustomisedTinkeringActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Hub` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `School` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SchoolVisit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `details` on the `SchoolVisit` table. All the data in the column will be lost.
  - You are about to drop the column `other_poc` on the `SchoolVisit` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TinkeringActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_HubClusters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_HubSpokes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserSchools` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CustomisedCompetition" DROP CONSTRAINT "CustomisedCompetition_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomisedCompetition" DROP CONSTRAINT "CustomisedCompetition_student_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomisedCourse" DROP CONSTRAINT "CustomisedCourse_course_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomisedCourse" DROP CONSTRAINT "CustomisedCourse_student_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomisedTinkeringActivity" DROP CONSTRAINT "CustomisedTinkeringActivity_base_ta_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomisedTinkeringActivity" DROP CONSTRAINT "CustomisedTinkeringActivity_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Hub" DROP CONSTRAINT "Hub_hub_school_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolVisit" DROP CONSTRAINT "SchoolVisit_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_school_id_fkey";

-- DropForeignKey
ALTER TABLE "_HubClusters" DROP CONSTRAINT "_HubClusters_A_fkey";

-- DropForeignKey
ALTER TABLE "_HubClusters" DROP CONSTRAINT "_HubClusters_B_fkey";

-- DropForeignKey
ALTER TABLE "_HubSpokes" DROP CONSTRAINT "_HubSpokes_A_fkey";

-- DropForeignKey
ALTER TABLE "_HubSpokes" DROP CONSTRAINT "_HubSpokes_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserSchools" DROP CONSTRAINT "_UserSchools_A_fkey";

-- AlterTable
ALTER TABLE "Cluster" DROP CONSTRAINT "Cluster_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cluster_id_seq";

-- AlterTable
ALTER TABLE "Competition" DROP CONSTRAINT "Competition_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Competition_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Competition_id_seq";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Course_id_seq";

-- AlterTable
ALTER TABLE "CustomisedCompetition" DROP CONSTRAINT "CustomisedCompetition_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "competition_id" SET DATA TYPE TEXT,
ALTER COLUMN "student_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CustomisedCompetition_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CustomisedCompetition_id_seq";

-- AlterTable
ALTER TABLE "CustomisedCourse" DROP CONSTRAINT "CustomisedCourse_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ALTER COLUMN "student_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CustomisedCourse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CustomisedCourse_id_seq";

-- AlterTable
ALTER TABLE "CustomisedTinkeringActivity" DROP CONSTRAINT "CustomisedTinkeringActivity_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "base_ta_id" SET DATA TYPE TEXT,
ALTER COLUMN "student_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CustomisedTinkeringActivity_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CustomisedTinkeringActivity_id_seq";

-- AlterTable
ALTER TABLE "Hub" DROP CONSTRAINT "Hub_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "hub_school_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Hub_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Hub_id_seq";

-- AlterTable
ALTER TABLE "School" DROP CONSTRAINT "School_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "School_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "School_id_seq";

-- AlterTable
ALTER TABLE "SchoolVisit" DROP CONSTRAINT "SchoolVisit_pkey",
DROP COLUMN "details",
DROP COLUMN "other_poc",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SchoolVisit_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SchoolVisit_id_seq";

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Student_id_seq";

-- AlterTable
ALTER TABLE "TinkeringActivity" DROP CONSTRAINT "TinkeringActivity_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TinkeringActivity_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TinkeringActivity_id_seq";

-- AlterTable
ALTER TABLE "_HubClusters" DROP CONSTRAINT "_HubClusters_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_HubClusters_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_HubSpokes" DROP CONSTRAINT "_HubSpokes_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_HubSpokes_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_UserSchools" DROP CONSTRAINT "_UserSchools_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_UserSchools_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCourse" ADD CONSTRAINT "CustomisedCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCourse" ADD CONSTRAINT "CustomisedCourse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_base_ta_id_fkey" FOREIGN KEY ("base_ta_id") REFERENCES "TinkeringActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCompetition" ADD CONSTRAINT "CustomisedCompetition_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCompetition" ADD CONSTRAINT "CustomisedCompetition_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hub" ADD CONSTRAINT "Hub_hub_school_id_fkey" FOREIGN KEY ("hub_school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolVisit" ADD CONSTRAINT "SchoolVisit_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSchools" ADD CONSTRAINT "_UserSchools_A_fkey" FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubSpokes" ADD CONSTRAINT "_HubSpokes_A_fkey" FOREIGN KEY ("A") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubSpokes" ADD CONSTRAINT "_HubSpokes_B_fkey" FOREIGN KEY ("B") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubClusters" ADD CONSTRAINT "_HubClusters_A_fkey" FOREIGN KEY ("A") REFERENCES "Cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HubClusters" ADD CONSTRAINT "_HubClusters_B_fkey" FOREIGN KEY ("B") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
