-- AlterTable
ALTER TABLE "User" ADD COLUMN     "comments" TEXT;

-- CreateTable
CREATE TABLE "_UserSchools" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserSchools_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserSchools_B_index" ON "_UserSchools"("B");

-- AddForeignKey
ALTER TABLE "_UserSchools" ADD CONSTRAINT "_UserSchools_A_fkey" FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSchools" ADD CONSTRAINT "_UserSchools_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
