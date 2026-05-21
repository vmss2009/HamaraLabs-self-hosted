-- CreateTable
CREATE TABLE IF NOT EXISTS "UserPermission" (
    "id"            TEXT        NOT NULL,
    "user_id"       TEXT        NOT NULL,
    "permission_id" TEXT        NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserPermission_user_id_permission_id_key"
    ON "UserPermission"("user_id", "permission_id");

CREATE INDEX IF NOT EXISTS "UserPermission_user_id_idx"       ON "UserPermission"("user_id");
CREATE INDEX IF NOT EXISTS "UserPermission_permission_id_idx" ON "UserPermission"("permission_id");

-- AddForeignKey
ALTER TABLE "UserPermission"
    ADD CONSTRAINT "UserPermission_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPermission"
    ADD CONSTRAINT "UserPermission_permission_id_fkey"
    FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
