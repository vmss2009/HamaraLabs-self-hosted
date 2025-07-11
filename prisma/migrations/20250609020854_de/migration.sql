/*
  Warnings:

  - You are about to drop the `CustomisedCompetition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomisedCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomisedTinkeringActivity` table. If the table is not empty, all the data it contains will be lost.

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
ALTER TABLE "CustomisedTinkeringActivity" DROP CONSTRAINT "CustomisedTinkeringActivity_subtopic_id_fkey";

-- DropTable
DROP TABLE "CustomisedCompetition";

-- DropTable
DROP TABLE "CustomisedCourse";

-- DropTable
DROP TABLE "CustomisedTinkeringActivity";

-- CreateTable
CREATE TABLE "customised_course" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT[],

    CONSTRAINT "customised_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customised_tinkering_activity" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "subtopic_id" INTEGER NOT NULL,
    "introduction" TEXT NOT NULL,
    "goals" TEXT[],
    "materials" TEXT[],
    "instructions" TEXT[],
    "tips" TEXT[],
    "observations" TEXT[],
    "extensions" TEXT[],
    "resources" TEXT[],
    "base_ta_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT[],

    CONSTRAINT "customised_tinkering_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customised_competition" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "competition_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT[],

    CONSTRAINT "customised_competition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "customised_course" ADD CONSTRAINT "customised_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_course" ADD CONSTRAINT "customised_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_tinkering_activity" ADD CONSTRAINT "customised_tinkering_activity_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "Subtopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_tinkering_activity" ADD CONSTRAINT "customised_tinkering_activity_base_ta_id_fkey" FOREIGN KEY ("base_ta_id") REFERENCES "TinkeringActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_tinkering_activity" ADD CONSTRAINT "customised_tinkering_activity_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_competition" ADD CONSTRAINT "customised_competition_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customised_competition" ADD CONSTRAINT "customised_competition_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
