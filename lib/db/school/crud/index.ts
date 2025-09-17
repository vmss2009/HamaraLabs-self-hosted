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

async function createOrUpdateUser(userData: UserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    return await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_meta_data: {
          phone_number: userData.phone_number,
          ...userData.user_meta_data,
        },
      },
    });
  } else {
    return await prisma.user.create({
      data: {
        id: uuidv4(),
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
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
    // Create or update users
    const inChargeUsers = await Promise.all(
      data.in_charges.map(userData => createOrUpdateUser(userData))
    );
    const principalUsers = await Promise.all(
      data.principals.map(userData => createOrUpdateUser(userData))
    );
    const correspondentUsers = await Promise.all(
      data.correspondents.map(userData => createOrUpdateUser(userData))
    );

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

    // Create user roles
    const userRoles = [
      ...inChargeUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: school.id,
        role: 'INCHARGE' as const,
      })),
      ...principalUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: school.id,
        role: 'PRINCIPAL' as const,
      })),
      ...correspondentUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: school.id,
        role: 'CORRESPONDENT' as const,
      })),
    ];

    await prisma.userRole.createMany({
      data: userRoles,
    });

    // Return school with user roles
    const schoolWithRoles = await prisma.school.findUnique({
      where: { id: school.id },
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
        user_roles: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      ...schoolWithRoles!,
      id: schoolWithRoles!.id.toString(),
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
        user_roles: {
          include: {
            user: true,
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
        user_roles: {
          include: {
            user: true,
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
      include: {
        user_roles: {
          include: {
            user: true,
          },
        },
      },
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

    // Remove all existing user roles for this school
    await prisma.userRole.deleteMany({
      where: { school_id: id },
    });

    // Create or update users and create new roles
    const inChargeUsers = await Promise.all(
      data.in_charges.map(userData => createOrUpdateUser(userData))
    );
    const principalUsers = await Promise.all(
      data.principals.map(userData => createOrUpdateUser(userData))
    );
    const correspondentUsers = await Promise.all(
      data.correspondents.map(userData => createOrUpdateUser(userData))
    );

    // Create user roles
    const userRoles = [
      ...inChargeUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: id,
        role: 'INCHARGE' as const,
      })),
      ...principalUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: id,
        role: 'PRINCIPAL' as const,
      })),
      ...correspondentUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        school_id: id,
        role: 'CORRESPONDENT' as const,
      })),
    ];

    if (userRoles.length > 0) {
      await prisma.userRole.createMany({
        data: userRoles,
      });
    }

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
        user_roles: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      ...school,
      id: school.id.toString(),
    };
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: string) {
  return prisma.school.delete({
    where: { id },
  });
}
