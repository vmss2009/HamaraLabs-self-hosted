-- Add optional comments column to CustomisedTinkeringActivity
ALTER TABLE "CustomisedTinkeringActivity"
ADD COLUMN IF NOT EXISTS "comments" TEXT;