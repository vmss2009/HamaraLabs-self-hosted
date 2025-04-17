-- CreateTable
CREATE TABLE "CustomisedCompetition" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "competition_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "CustomisedCompetition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomisedCompetition" ADD CONSTRAINT "CustomisedCompetition_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCompetition" ADD CONSTRAINT "CustomisedCompetition_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
