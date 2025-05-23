-- CreateTable
CREATE TABLE "CustomisedCourse" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" TEXT[],

    CONSTRAINT "CustomisedCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomisedCourse" ADD CONSTRAINT "CustomisedCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedCourse" ADD CONSTRAINT "CustomisedCourse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
