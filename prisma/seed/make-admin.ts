/**
 * make-admin.ts — create (or promote) a user to admin in the application DB.
 * Does NOT touch Authentik — the Authentik account must already exist.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json prisma/seed/make-admin.ts [email]
 *
 * Defaults to mohan@hamaralabs.com when no argument is supplied.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

(async () => {
  const email = process.argv[2] ?? "mohan@hamaralabs.com";

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create the DB record; Authentik account already exists.
    user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        user_meta_data: { isAdmin: true },
        roles: ["admin"],
        schools: [],
      },
    });
    console.log(`✓ Created user ${email} with admin role`);
  } else {
    const nextMeta = {
      ...((user.user_meta_data as Record<string, unknown>) ?? {}),
      isAdmin: true,
    };
    const nextRoles = user.roles.includes("admin")
      ? user.roles
      : [...user.roles, "admin"];

    await prisma.user.update({
      where: { id: user.id },
      data: { user_meta_data: nextMeta, roles: { set: nextRoles } },
    });
    console.log(`✓ Promoted existing user ${email} to admin`);
  }
})().finally(() => prisma.$disconnect());
