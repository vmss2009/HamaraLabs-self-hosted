-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organized_by" TEXT NOT NULL,
    "application_start_date" TIMESTAMP(3) NOT NULL,
    "application_end_date" TIMESTAMP(3) NOT NULL,
    "course_start_date" TIMESTAMP(3) NOT NULL,
    "course_end_date" TIMESTAMP(3) NOT NULL,
    "eligibility_from" TEXT NOT NULL,
    "eligibility_to" TEXT NOT NULL,
    "reference_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
