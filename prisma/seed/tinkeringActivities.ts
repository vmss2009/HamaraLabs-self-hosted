import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

type TinkeringActivityInput = {
  name: string;
  introduction: string;
  goals: string[];
  materials: string[];
  instructions: string[];
  tips: string[];
  observations: string[];
  extensions: string[];
  resources: string[];
  subtopic_id: number;
};

async function main() {
  const rawData = fs.readFileSync('/Users/mohan/Projects/HamaraLabs - Project/Next JS/public-hamaralabs-self-hosted/HamaraLabs-self-hosted/prisma/seed/data2.json', 'utf-8');
  const activities: TinkeringActivityInput[] = JSON.parse(rawData);

  for (const activity of activities) {
    try {
      const created = await prisma.tinkeringActivity.create({
        data: {
          name: activity.name,
          introduction: activity.introduction,
          goals: activity.goals,
          materials: activity.materials,
          instructions: activity.instructions,
          tips: activity.tips,
          observations: activity.observations,
          extensions: activity.extensions,
          resources: activity.resources,
          subtopic_id: activity.subtopic_id,
        },
      });

      console.log(`✅ Inserted activity: ${created.name}`);
    } catch (err) {
      console.error(`❌ Failed to insert activity: ${activity.name}`, err);
    }
  }

  console.log('🎉 All activities processed.');
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });