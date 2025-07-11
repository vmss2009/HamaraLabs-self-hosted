-- CreateTable
CREATE TABLE "SchoolVisit" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "school_id" INTEGER NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "poc_id" TEXT,
    "other_poc" TEXT,
    "details" JSONB NOT NULL,

    CONSTRAINT "SchoolVisit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SchoolVisit" ADD CONSTRAINT "SchoolVisit_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolVisit" ADD CONSTRAINT "SchoolVisit_poc_id_fkey" FOREIGN KEY ("poc_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
