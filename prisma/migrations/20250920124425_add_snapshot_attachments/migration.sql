-- Create SnapshotAttachments table for customised entities
CREATE TABLE IF NOT EXISTS "SnapshotAttachments" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "filename" TEXT,
  "size" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customised_ta_id" TEXT,
  "customised_competition_id" TEXT,
  "customised_course_id" TEXT,
  CONSTRAINT "fk_snapshot_ta" FOREIGN KEY ("customised_ta_id") REFERENCES "CustomisedTinkeringActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_snapshot_comp" FOREIGN KEY ("customised_competition_id") REFERENCES "CustomisedCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_snapshot_course" FOREIGN KEY ("customised_course_id") REFERENCES "CustomisedCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for quick lookup by parent
CREATE INDEX IF NOT EXISTS "idx_snapshot_ta" ON "SnapshotAttachments" ("customised_ta_id");
CREATE INDEX IF NOT EXISTS "idx_snapshot_comp" ON "SnapshotAttachments" ("customised_competition_id");
CREATE INDEX IF NOT EXISTS "idx_snapshot_course" ON "SnapshotAttachments" ("customised_course_id");

-- Ensure exactly one parent is set (Postgres)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'snapshot_attachments_one_parent'
  ) THEN
    ALTER TABLE "SnapshotAttachments"
      ADD CONSTRAINT snapshot_attachments_one_parent
      CHECK ((CASE WHEN customised_ta_id IS NOT NULL THEN 1 ELSE 0 END
           +  CASE WHEN customised_competition_id IS NOT NULL THEN 1 ELSE 0 END
           +  CASE WHEN customised_course_id IS NOT NULL THEN 1 ELSE 0 END) = 1);
  END IF;
END$$;