const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const prisma = new PrismaClient();

async function migrateStudents() {
  const snapshot = await db.collection("studentData").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Extract school name and find its ID from PostgreSQL
    const schoolName = data.school?.trim();
    if (!schoolName) {
      console.warn("Missing school name, skipping:", doc.id);
      continue;
    }

    const school = await prisma.school.findFirst({
      where: { name: schoolName },
    });

    if (!school) {
      console.warn(`School not found for name "${schoolName}", skipping:`, doc.id);
      continue;
    }

    // Create student record
    try {
      await prisma.student.create({
        data: {
          first_name: data.name?.firstName || "Unknown",
          last_name: data.name?.lastName || "Unknown",
          aspiration: data.aspiration || "Unknown",
          gender: data.gender || "Unknown",
          email: data.email || null,
          class: data.class || "Unknown",
          section: data.section || "Unknown",
          comments: data.comments || null,
          school_id: school.id,
        },
      });

      console.log(`✅ Migrated student: ${data.name?.firstName} ${data.name?.lastName}`);
    } catch (error) {
      console.error("❌ Error creating student:", doc.id, error);
    }
  }

  await prisma.$disconnect();
  console.log("🎉 Student migration completed.");
}

migrateStudents().catch((e) => {
  console.error("Migration failed:", e);
  prisma.$disconnect();
});