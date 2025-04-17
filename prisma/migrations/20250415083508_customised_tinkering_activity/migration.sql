-- CreateTable
CREATE TABLE "CustomisedTinkeringActivity" (
    "id" SERIAL NOT NULL,
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
    "base_ta_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "CustomisedTinkeringActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "Subtopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_base_ta_id_fkey" FOREIGN KEY ("base_ta_id") REFERENCES "TinkeringActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomisedTinkeringActivity" ADD CONSTRAINT "CustomisedTinkeringActivity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
