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

async function createOrUpdateUser(userData: UserInput, schoolId: string) {
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
      
    return await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        schools: updatedSchools,
        user_meta_data: {
          phone_number: userData.phone_number,
          ...userData.user_meta_data,
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
          ...userData.user_meta_data,
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
    const allUsers = [...data.in_charges, ...data.principals, ...data.correspondents];
    console.log(`Processing ${allUsers.length} users for school: ${school.id}`);
    console.log('User data:', allUsers.map(u => ({ email: u.email, first_name: u.first_name, last_name: u.last_name })));
    
    await Promise.all(
      allUsers.map(userData => createOrUpdateUser(userData, school.id))
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

    // Create or update users and add school to their schools array
    const allUsers = [...data.in_charges, ...data.principals, ...data.correspondents];
    await Promise.all(
      allUsers.map(userData => createOrUpdateUser(userData, school.id))
    );

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
  return prisma.school.delete({
    where: { id },
  });
}
