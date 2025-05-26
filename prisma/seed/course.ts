import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Types for your JSON format
type CourseJSON = {
  name: string;
  description: string;
  organised_by: string;
  application_start_date: string;
  application_end_date: string;
  course_start_date: string;
  course_end_date: string;
  eligibility_from: string;
  eligibility_to: string;
  reference_link: string;
  requirements: string[];
  course_tags: string[];
};

// Convert a string to Date if not empty
function parseDate(dateStr: string): Date {
  if (!dateStr) {
    return new Date(); // fallback or handle as needed
  }
  return new Date(dateStr);
}

async function main() {
  const rawData = fs.readFileSync('/Users/mohan/Projects/HamaraLabs - Project/Next JS/public-hamaralabs-self-hosted/HamaraLabs-self-hosted/prisma/seed/data3.json', 'utf-8');
  const courses: CourseJSON[] = JSON.parse(rawData);

  for (const course of courses) {
    try {
      await prisma.course.create({
        data: {
          name: course.name,
          description: course.description,
          organized_by: course.organised_by,
          application_start_date: parseDate(course.application_start_date),
          application_end_date: parseDate(course.application_end_date || course.application_start_date), // fallback
          course_start_date: parseDate(course.course_start_date),
          course_end_date: parseDate(course.course_end_date || course.course_start_date), // fallback
          eligibility_from: course.eligibility_from,
          eligibility_to: course.eligibility_to || course.eligibility_from, // fallback
          reference_link: course.reference_link,
          requirements: course.requirements,
          course_tags: course.course_tags,
        },
      });

      console.log(`✅ Inserted course: ${course.name}`);
    } catch (err) {
      console.error(`❌ Error inserting course "${course.name}":`, err);
    }
  }

  console.log('🎉 All courses processed.');
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });