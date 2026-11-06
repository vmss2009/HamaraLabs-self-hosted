-- Backfill User.roles from current relations.
-- Preserves non-derived roles (e.g. "admin"); recomputes
-- principal / incharge / correspondent / mentor / student
-- for every user so pre-existing rows match the syncDerivedRoles logic.

UPDATE "User" u
SET roles = (
  SELECT ARRAY(
    SELECT DISTINCT role
    FROM (
      -- Keep any role that is NOT one of the five derived ones
      (
        SELECT unnest(u.roles) AS role
        EXCEPT
        SELECT unnest(ARRAY['principal', 'incharge', 'correspondent', 'mentor', 'student']::text[])
      )
      UNION ALL
      SELECT 'principal'     WHERE EXISTS (SELECT 1 FROM "_SchoolPrincipals"    WHERE "B" = u.id)
      UNION ALL
      SELECT 'incharge'      WHERE EXISTS (SELECT 1 FROM "_SchoolIncharges"     WHERE "B" = u.id)
      UNION ALL
      SELECT 'correspondent' WHERE EXISTS (SELECT 1 FROM "_SchoolCorrespondents" WHERE "B" = u.id)
      UNION ALL
      SELECT 'mentor'        WHERE EXISTS (SELECT 1 FROM "Mentor"  WHERE user_id = u.id)
      UNION ALL
      SELECT 'student'       WHERE EXISTS (SELECT 1 FROM "Student" WHERE user_id = u.id)
    ) r(role)
    ORDER BY role
  )
);
