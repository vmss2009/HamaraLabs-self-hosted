-- Add attachments string[] column to CustomisedTinkeringActivity
ALTER TABLE "CustomisedTinkeringActivity"
ADD COLUMN IF NOT EXISTS "attachments" TEXT[] DEFAULT '{}';