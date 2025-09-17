// Test script to verify User schools array functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserSchools() {
  try {
    console.log('=== Testing User Schools Array Functionality ===\n');

    // 1. Check if any users exist with schools
    const usersWithSchools = await prisma.user.findMany({
      where: {
        schools: {
          isEmpty: false,
        },
      },
    });

    console.log(`Found ${usersWithSchools.length} users with schools:`);
    usersWithSchools.forEach(user => {
      console.log(`- ${user.email}: schools = [${user.schools.join(', ')}]`);
    });
    console.log();

    // 2. Check all schools
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Found ${schools.length} schools:`);
    schools.forEach(school => {
      console.log(`- ${school.name} (ID: ${school.id})`);
    });
    console.log();

    // 3. For each school, find users associated with it
    for (const school of schools) {
      const schoolUsers = await prisma.user.findMany({
        where: {
          schools: {
            has: school.id,
          },
        },
      });

      console.log(`Users associated with school "${school.name}" (${school.id}):`);
      if (schoolUsers.length === 0) {
        console.log('  - No users found');
      } else {
        schoolUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
        });
      }
      console.log();
    }

    // 4. Check all users and their schools
    const allUsers = await prisma.user.findMany({
      orderBy: {
        email: 'asc',
      },
    });

    console.log('=== All Users and Their Schools ===');
    allUsers.forEach(user => {
      console.log(`${user.email}: schools = [${user.schools.join(', ')}]`);
    });

  } catch (error) {
    console.error('Error testing user schools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSchools();