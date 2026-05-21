ALTER TABLE "User" ADD COLUMN "roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "User" u
SET "roles" = sub.role_names
FROM (
  SELECT ur."user_id", array_agg(DISTINCT r."name") AS role_names
  FROM "UserRole" ur
  JOIN "Role" r ON r."id" = ur."role_id"
  GROUP BY ur."user_id"
) sub
WHERE u."id" = sub."user_id";

ALTER TABLE "UserRole" DROP CONSTRAINT IF EXISTS "UserRole_user_id_fkey";
ALTER TABLE "UserRole" DROP CONSTRAINT IF EXISTS "UserRole_role_id_fkey";
DROP TABLE "UserRole";
