CREATE TABLE IF NOT EXISTS "_SchoolIncharges" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_SchoolIncharges_AB_unique" ON "_SchoolIncharges"("A", "B");
CREATE INDEX IF NOT EXISTS "_SchoolIncharges_B_index" ON "_SchoolIncharges"("B");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolIncharges_A_fkey') THEN
    ALTER TABLE "_SchoolIncharges" ADD CONSTRAINT "_SchoolIncharges_A_fkey"
      FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolIncharges_B_fkey') THEN
    ALTER TABLE "_SchoolIncharges" ADD CONSTRAINT "_SchoolIncharges_B_fkey"
      FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "_SchoolPrincipals" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_SchoolPrincipals_AB_unique" ON "_SchoolPrincipals"("A", "B");
CREATE INDEX IF NOT EXISTS "_SchoolPrincipals_B_index" ON "_SchoolPrincipals"("B");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolPrincipals_A_fkey') THEN
    ALTER TABLE "_SchoolPrincipals" ADD CONSTRAINT "_SchoolPrincipals_A_fkey"
      FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolPrincipals_B_fkey') THEN
    ALTER TABLE "_SchoolPrincipals" ADD CONSTRAINT "_SchoolPrincipals_B_fkey"
      FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "_SchoolCorrespondents" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_SchoolCorrespondents_AB_unique" ON "_SchoolCorrespondents"("A", "B");
CREATE INDEX IF NOT EXISTS "_SchoolCorrespondents_B_index" ON "_SchoolCorrespondents"("B");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolCorrespondents_A_fkey') THEN
    ALTER TABLE "_SchoolCorrespondents" ADD CONSTRAINT "_SchoolCorrespondents_A_fkey"
      FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_SchoolCorrespondents_B_fkey') THEN
    ALTER TABLE "_SchoolCorrespondents" ADD CONSTRAINT "_SchoolCorrespondents_B_fkey"
      FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

WITH normalized AS (
  SELECT
    u.id                                AS user_id,
    rbs.key                             AS school_id,
    UPPER(role_value)                   AS role_name
  FROM "User" u
  CROSS JOIN LATERAL jsonb_each(COALESCE(u.user_meta_data->'rolesBySchool', '{}'::jsonb)) AS rbs(key, value)
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(rbs.value) = 'array' THEN rbs.value
      ELSE jsonb_build_array(rbs.value)
    END
  ) AS role_value
)
INSERT INTO "_SchoolIncharges" ("A", "B")
SELECT DISTINCT n.school_id, n.user_id
FROM normalized n
JOIN "School" s ON s.id = n.school_id
WHERE n.role_name IN ('INCHARGE', 'IN-CHARGE')
ON CONFLICT ("A", "B") DO NOTHING;

WITH normalized AS (
  SELECT
    u.id                                AS user_id,
    rbs.key                             AS school_id,
    UPPER(role_value)                   AS role_name
  FROM "User" u
  CROSS JOIN LATERAL jsonb_each(COALESCE(u.user_meta_data->'rolesBySchool', '{}'::jsonb)) AS rbs(key, value)
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(rbs.value) = 'array' THEN rbs.value
      ELSE jsonb_build_array(rbs.value)
    END
  ) AS role_value
)
INSERT INTO "_SchoolPrincipals" ("A", "B")
SELECT DISTINCT n.school_id, n.user_id
FROM normalized n
JOIN "School" s ON s.id = n.school_id
WHERE n.role_name = 'PRINCIPAL'
ON CONFLICT ("A", "B") DO NOTHING;

WITH normalized AS (
  SELECT
    u.id                                AS user_id,
    rbs.key                             AS school_id,
    UPPER(role_value)                   AS role_name
  FROM "User" u
  CROSS JOIN LATERAL jsonb_each(COALESCE(u.user_meta_data->'rolesBySchool', '{}'::jsonb)) AS rbs(key, value)
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(rbs.value) = 'array' THEN rbs.value
      ELSE jsonb_build_array(rbs.value)
    END
  ) AS role_value
)
INSERT INTO "_SchoolCorrespondents" ("A", "B")
SELECT DISTINCT n.school_id, n.user_id
FROM normalized n
JOIN "School" s ON s.id = n.school_id
WHERE n.role_name = 'CORRESPONDENT'
ON CONFLICT ("A", "B") DO NOTHING;

UPDATE "User"
SET user_meta_data = user_meta_data - 'rolesBySchool'
WHERE user_meta_data ? 'rolesBySchool';
