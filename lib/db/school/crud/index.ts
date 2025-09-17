import { prisma } from "@/lib/db/prisma";
import {
  SchoolCreateInput,
  SchoolFilter,
  SchoolUpdateInput,
  SchoolWithAddress,
  UserInput,
} from "../type";
import { v4 as uuidv4 } from "uuid";
import type { Prisma } from "@prisma/client";

async function cleanupOrphanedUser(userId: string) {
  try {
    // Check if user has any relationships that prevent deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: true,
        mentors: true,
        school_visits: true,
      },
    });

    if (!user) {
      console.log(`User ${userId} not found, already deleted`);
      return;
    }

    // Check if user has empty schools array and no other relationships
    if (
      user.schools.length === 0 && 
      user.students.length === 0 && 
      user.mentors.length === 0 && 
      user.school_visits.length === 0
    ) {
      console.log(`Deleting orphaned user ${user.email} with no associations`);
      await prisma.user.delete({
        where: { id: userId },
      });
    } else {
      console.log(`Keeping user ${user.email}: schools=${user.schools.length}, students=${user.students.length}, mentors=${user.mentors.length}, visits=${user.school_visits.length}`);
    }
  } catch (error) {
    console.error(`Error cleaning up user ${userId}:`, error);
  }
}

type SchoolRole = 'INCHARGE' | 'PRINCIPAL' | 'CORRESPONDENT';

async function createOrUpdateUser(userData: UserInput, schoolId: string, role: SchoolRole) {
  console.log(`Creating/updating user for email: ${userData.email}, school: ${schoolId}`);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    console.log(`Found existing user: ${existingUser.id}, current schools: ${existingUser.schools}`);
    // Add school to existing user's schools array if not already present
    const updatedSchools = existingUser.schools.includes(schoolId) 
      ? existingUser.schools 
      : [...existingUser.schools, schoolId];
    
    console.log(`Updated schools array: ${updatedSchools}`);
      
    // Merge user_meta_data safely and append role under rolesBySchool
    const currentMeta = (existingUser.user_meta_data ?? {}) as Record<string, any>;
    const rolesBySchool: Record<string, string[] | string> = { ...(currentMeta.rolesBySchool ?? {}) };
    const existing = rolesBySchool[schoolId];
    let updatedForSchool: string[];
    if (!existing) {
      updatedForSchool = [role];
    } else if (Array.isArray(existing)) {
      updatedForSchool = Array.from(new Set([...existing, role]));
    } else {
      updatedForSchool = Array.from(new Set([existing, role]));
    }
    rolesBySchool[schoolId] = updatedForSchool;

    return await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        schools: updatedSchools,
        user_meta_data: {
          ...currentMeta,
          phone_number: userData.phone_number,
          ...(userData.user_meta_data ?? {}),
          rolesBySchool,
        },
      },
    });
  } else {
    console.log(`Creating new user for email: ${userData.email}`);
    return await prisma.user.create({
      data: {
        id: uuidv4(),
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        schools: [schoolId],
        user_meta_data: {
          phone_number: userData.phone_number,
          ...(userData.user_meta_data ?? {}),
          rolesBySchool: { [schoolId]: [role] },
        },
      },
    });
  }
}

export async function createSchool(data: SchoolCreateInput): Promise<SchoolWithAddress> {
  try {
    const school = await prisma.school.create({
      data: {
        name: data.name,
        udise_code: data.udise_code,
        is_ATL: data.is_ATL,
        ATL_establishment_year: data.ATL_establishment_year,
        address_id: data.address_id,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Create or update users and add school to their schools array
    const usersWithRoles: Array<{user: UserInput; role: SchoolRole}> = [
      ...data.in_charges.map(u => ({ user: u, role: 'INCHARGE' as const })),
      ...data.principals.map(u => ({ user: u, role: 'PRINCIPAL' as const })),
      ...data.correspondents.map(u => ({ user: u, role: 'CORRESPONDENT' as const })),
    ];
    console.log(`Processing ${usersWithRoles.length} users for school: ${school.id}`);
    console.log('User data:', usersWithRoles.map(({user, role}) => ({ email: user.email, role })));

    await Promise.all(
      usersWithRoles.map(({user, role}) => createOrUpdateUser(user, school.id, role))
    );
    
    console.log('All users processed successfully');

    return {
      ...school,
      id: school.id.toString(),
    };
  } catch (error) {
    console.error("Error creating school:", error);
    throw error;
  }
}

export async function getSchools(filter?: SchoolFilter): Promise<SchoolWithAddress[]> {
  try {
    const where: Prisma.SchoolWhereInput = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
    }

    if (filter?.is_ATL !== undefined) {
      where.is_ATL = filter.is_ATL;
    }

    if (filter?.paid_subscription !== undefined) {
      where.paid_subscription = filter.paid_subscription;
    }

    if (filter?.cityId || filter?.stateId || filter?.countryId) {
      where.address = {
        city: {
          ...(filter?.cityId ? { id: filter.cityId } : {}),
          ...(filter?.stateId || filter?.countryId
            ? {
                state: {
                  ...(filter?.stateId ? { id: filter.stateId } : {}),
                  ...(filter?.countryId ? { country: { id: filter.countryId } } : {}),
                },
              }
            : {}),
        },
      } as Prisma.AddressWhereInput;
    }

    const schools = await prisma.school.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return schools.map((school) => ({
      ...school,
      id: school.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function getSchoolById(id: string): Promise<SchoolWithAddress | null> {
  try {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return school
      ? {
          ...school,
          id: school.id.toString(),
        }
      : null;
  } catch (error) {
    console.error(`Error fetching school with id ${id}:`, error);
    throw error;
  }
}

export async function updateSchool(id: string, data: SchoolUpdateInput): Promise<SchoolWithAddress> {
  try {
    const currentSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!currentSchool) {
      throw new Error("School not found");
    }

    // Get current users associated with this school before update
    const currentUsers = await prisma.user.findMany({
      where: {
        schools: {
          has: id,
        },
      },
      select: {
        id: true,
        email: true,
        schools: true,
      },
    });

    console.log(`Found ${currentUsers.length} users currently associated with school ${id}`);
    console.log('Current users:', currentUsers.map(u => ({ email: u.email, schools: u.schools })));

    if (data.address) {
      await prisma.address.update({
        where: { id: currentSchool.address_id },
        data: {
          address_line1: data.address.address_line1,
          address_line2: data.address.address_line2,
          pincode: data.address.pincode,
          city_id: data.address.city_id,
        },
      });
    }

    // Update school data
    const school = await prisma.school.update({
      where: { id },
      data: {
        name: data.name,
        udise_code: data.udise_code,
        is_ATL: data.is_ATL,
        ATL_establishment_year: data.ATL_establishment_year,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get all new user emails from the update data
    const newUserEmails = new Set([
      ...data.in_charges.map(u => u.email.toLowerCase().trim()),
      ...data.principals.map(u => u.email.toLowerCase().trim()),
      ...data.correspondents.map(u => u.email.toLowerCase().trim()),
    ]);

    console.log('New user emails:', Array.from(newUserEmails));

    // Process user associations
    await Promise.all([
      // 1. Remove school from users who are no longer associated
      ...currentUsers.map(async (user) => {
        if (!newUserEmails.has(user.email.toLowerCase().trim())) {
          console.log(`Removing school ${id} from user ${user.email}`);
          
          const updatedSchools = user.schools.filter(schoolId => schoolId !== id);
          console.log(`User ${user.email} schools after removal: ${updatedSchools}`);
          
          // Always update the user's schools array first
          await prisma.user.update({
            where: { id: user.id },
            data: {
              schools: updatedSchools,
            },
          });
          
          // Then check if user should be deleted
          if (updatedSchools.length === 0) {
            console.log(`User ${user.email} has no schools, checking if they should be deleted`);
            await cleanupOrphanedUser(user.id);
          }
        }
      }),
      
      // 2. Add school to new/existing users
      ...[
        ...data.in_charges.map(u => ({ user: u, role: 'INCHARGE' as const })),
        ...data.principals.map(u => ({ user: u, role: 'PRINCIPAL' as const })),
        ...data.correspondents.map(u => ({ user: u, role: 'CORRESPONDENT' as const })),
      ].map(({user, role}) => createOrUpdateUser(user, school.id, role)),
    ]);

    console.log('User associations updated successfully');

    return {
      ...school,
      id: school.id.toString(),
    };
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}

export async function getSchoolUsers(schoolId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        schools: {
          has: schoolId,
        },
      },
    });
    return users;
  } catch (error) {
    console.error(`Error fetching users for school ${schoolId}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: string) {
  // 1) Find users associated with this school
  const users = await prisma.user.findMany({
    where: { schools: { has: id } },
    select: { id: true, schools: true, user_meta_data: true, email: true },
  });

  // 2) For each user, remove the school from schools[] and strip rolesBySchool[id]
  await Promise.all(
    users.map(async (user) => {
      const updatedSchools = user.schools.filter((sid) => sid !== id);

      const currentMeta = (user.user_meta_data ?? {}) as Record<string, any>;
      const rolesBySchool: Record<string, string[] | string> = {
        ...(currentMeta.rolesBySchool ?? {}),
      };
      if (rolesBySchool[id]) {
        delete rolesBySchool[id];
      }
      const newMeta = { ...currentMeta, rolesBySchool };

      await prisma.user.update({
        where: { id: user.id },
        data: { schools: updatedSchools, user_meta_data: newMeta },
      });

      // If user has no schools left, consider them orphaned and delete
      if (updatedSchools.length === 0) {
        await cleanupOrphanedUser(user.id);
      }
    })
  );

  // 3) Delete the school
  return prisma.school.delete({ where: { id } });
}
