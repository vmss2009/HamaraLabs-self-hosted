-- CreateTable
CREATE TABLE "Competition" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organised_by" TEXT NOT NULL,
    "application_start" TIMESTAMP(3) NOT NULL,
    "application_end" TIMESTAMP(3) NOT NULL,
    "competition_start" TIMESTAMP(3) NOT NULL,
    "competition_end" TIMESTAMP(3) NOT NULL,
    "eligibility" TEXT[],
    "constraints" JSONB NOT NULL,
    "reference_links" TEXT[],
    "requirements" TEXT[],
    "payment_type" TEXT NOT NULL,
    "fee" TEXT,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);
