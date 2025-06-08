const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const prisma = new PrismaClient();

async function migrate() {
  const snapshot = await db.collection("schoolData").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Get or create a city ID (random between 1 and 4000)
    const city_id = Math.floor(Math.random() * 4000) + 1;

    // Create address
    const address = await prisma.address.create({
      data: {
        address_line1: data.address?.addressLine1 || null,
        address_line2: null,
        pincode: data.address?.pincode || "",
        city_id: city_id,
      },
    });

    // Map syllabus (array of booleans to list of strings)
    const syllabus = [];
    if (data.syllabus?.cbse) syllabus.push("CBSE");
    if (data.syllabus?.ib) syllabus.push("IB");
    if (data.syllabus?.icse) syllabus.push("ICSE");
    if (data.syllabus?.igcse) syllabus.push("IGCSE");
    if (data.syllabus?.state) syllabus.push("STATE");

    // Social media links are not available in screenshot, assumed empty
    const social_links = [];

    // Create School
    await prisma.school.create({
      data: {
        name: data.name || "Unnamed School",
        is_ATL: data.isATL || false,
        ATL_establishment_year: null,
        address_id: address.id,
        in_charge_id: null,
        correspondent_id: null,
        principal_id: null,
        syllabus,
        website_url: data.webSite || null,
        paid_subscription: data.paidSubscription || false,
        social_links,
      },
    });

    console.log(`Migrated: ${data.name}`);
  }

  console.log("Migration complete.");
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  prisma.$disconnect();
});