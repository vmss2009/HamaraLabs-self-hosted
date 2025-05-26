import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

type SubtopicJSON = {
  id: number;
  name: string;
};

type TopicJSON = {
  id: number;
  name: string;
  subTopics: SubtopicJSON[];
};

type SubjectJSON = {
  id: number;
  name: string;
  topics: TopicJSON[];
};

async function main() {
const rawData = fs.readFileSync('/Users/mohan/Projects/HamaraLabs - Project/Next JS/public-hamaralabs-self-hosted/HamaraLabs-self-hosted/prisma/seed/data.json', 'utf-8');
  const subjects: SubjectJSON[] = JSON.parse(rawData);

  for (const subjectData of subjects) {
    const subject = await prisma.subject.create({
    data: {
        id: subjectData.id,
        subject_name: subjectData.name,
        topics: {
            create: subjectData.topics.map((topic) => ({
            id: topic.id,
            topic_name: topic.name,
            subtopics: {
                create: topic.subTopics.map((sub) => ({
                id: sub.id,
                subtopic_name: sub.name,
                })),
            },
            })),
        },
        },
    });

    console.log(`Inserted subject: ${subject.subject_name}`);
  }

  console.log("✅ All subjects inserted successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error inserting subjects:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });