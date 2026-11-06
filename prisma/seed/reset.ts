/**
 * reset.ts — wipe all application data while preserving reference tables.
 *
 * Preserved: Country, State, City, Address, Permission, Role, RolePermission
 * Cleared  : User, School, Student, Mentor, SchoolVisit, Hub, Cluster,
 *            Competition, Course, Subject/Topic/Subtopic/TinkeringActivity,
 *            all Customised* variants, Chat, Tasks, Notifications,
 *            Schedules, Bookings, Slots, and all implicit M2M tables.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json prisma/seed/reset.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Resetting all application data…");

  // A single TRUNCATE … CASCADE lets PostgreSQL resolve FK order automatically.
  // The tables listed here are the "roots"; CASCADE reaches every dependent
  // table (including implicit Prisma M2M tables) without us having to list them.
  //
  // NOT affected: Country, State, City, Address,
  //               Permission, Role, RolePermission
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "User",
      "School",
      "Mentor",
      "Competition",
      "Course",
      "Subject",
      "Slot",
      "Cluster"
    RESTART IDENTITY CASCADE
  `;

  console.log("✅ Done. The following tables were preserved:");
  console.log("   Country · State · City · Address");
  console.log("   Permission · Role · RolePermission");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
