import { prisma } from "@/lib/db/prisma";
import {
  SchoolCreateInput,
  SchoolFilter,
  SchoolUpdateInput,
  SchoolWithAddress,
  UserInput,
} from "../type";
import type { Prisma } from "@prisma/client";
import { createUser, updateUser, deleteUser } from "@/lib/db/auth/user";

type SchoolRole = 'INCHARGE' | 'PRINCIPAL' | 'CORRESPONDENT';
type UserMeta = Prisma.InputJsonValue;

async function getUsersBySchoolBasic(school_id: string): Promise<Array<{ id: string; email: string; schools: string[] }>> {
    return prisma.user.findMany({
        where: { schools: { has: school_id } },
        select: { id: true, email: true, schools: true },
    });
}

async function getUsersBySchoolWithMeta(school_id: string): Promise<Array<{ id: string; email: string; first_name: string | null; last_name: string | null; schools: string[]; user_meta_data: Prisma.JsonValue | null }>> {
    return prisma.user.findMany({
        where: { schools: { has: school_id } },
    select: { id: true, email: true, first_name: true, last_name: true, schools: true, user_meta_data: true },
    });
}

async function addOrUpdateUserForSchoolRole(userData: UserInput, schoolId: string, role: SchoolRole) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });

    if (existingUser) {
        const updatedSchools = existingUser.schools.includes(schoolId)
            ? existingUser.schools
            : [...existingUser.schools, schoolId];

        const currentMeta = (existingUser.user_meta_data ?? {}) as Record<string, any>;
        const rolesBySchool: Record<string, string[] | string> = { ...(currentMeta.rolesBySchool ?? {}) };
        const existing = rolesBySchool[schoolId];
        let updatedForSchool: string[];
        if (!existing) updatedForSchool = [role];
        else if (Array.isArray(existing)) updatedForSchool = Array.from(new Set([...existing, role]));
        else updatedForSchool = Array.from(new Set([existing, role]));
        rolesBySchool[schoolId] = updatedForSchool;

    // Only patch names when provided and non-empty after trim
    const namePatch: Partial<{ first_name: string; last_name: string }> = {};
    const fn = userData.first_name?.trim();
    const ln = userData.last_name?.trim();
    if (fn) namePatch.first_name = fn;
    if (ln) namePatch.last_name = ln;

    return updateUser(existingUser.id, {
      ...namePatch,
      schools: updatedSchools,
      user_meta_data: {
        ...currentMeta,
        phone_number: userData.phone_number,
        ...(userData.user_meta_data ?? {}),
        rolesBySchool,
      } as UserMeta,
    });
    }

  const fn = userData.first_name?.trim() || undefined;
  const ln = userData.last_name?.trim() || undefined;
  return createUser({
    email: userData.email,
    first_name: fn,
    last_name: ln,
    schools: [schoolId],
    user_meta_data: {
      phone_number: userData.phone_number,
      ...(userData.user_meta_data ?? {}),
      rolesBySchool: { [schoolId]: [role] },
    } as UserMeta,
  });
}

async function cleanupOrphanedUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { students: true, mentors: true, school_visits: true },
        });
        if (!user) return;
        if (
            user.schools.length === 0 &&
            user.students.length === 0 &&
            user.mentors.length === 0 &&
            user.school_visits.length === 0
        ) {
            await deleteUser(userId);
        }
    } catch (error) {
        console.error(`Error cleaning up user ${userId}:`, error);
    }
}

async function removeSchoolFromUserAndCleanup(userId: string, schoolId: string) {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { schools: true, user_meta_data: true } });
    if (!current) return [] as string[];
    const updatedSchools = (current.schools || []).filter((s) => s !== schoolId);
    const currentMeta = (current.user_meta_data ?? {}) as Record<string, any>;
    const rolesBySchool: Record<string, string[] | string> = { ...(currentMeta.rolesBySchool ?? {}) };
    if (rolesBySchool[schoolId]) delete rolesBySchool[schoolId];
    const newMeta = { ...currentMeta, rolesBySchool };
    await updateUser(userId, { schools: updatedSchools, user_meta_data: newMeta });
    if (updatedSchools.length === 0) await cleanupOrphanedUser(userId);
    return updatedSchools;
}

export async function createSchool(data: SchoolCreateInput): Promise<SchoolWithAddress> {
  try {
    const school = await prisma.school.create({
      data: {
        name: data.name,
        udise_code: data.udise_code,
        is_ATL: data.is_ATL,
        ATL_establishment_year: data.is_ATL ? (data.ATL_establishment_year ?? null) : null,
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

    await Promise.all(
      usersWithRoles.map(({user, role}) => addOrUpdateUserForSchoolRole(user, school.id, role))
    );
    

    // Connect role-based relations on School to Users by email
    const inchargeEmails = data.in_charges.map(u => u.email.toLowerCase().trim());
    const principalEmails = data.principals.map(u => u.email.toLowerCase().trim());
    const correspondentEmails = data.correspondents.map(u => u.email.toLowerCase().trim());

    const [inchargeUsers, principalUsers, correspondentUsers] = await Promise.all([
      prisma.user.findMany({ where: { email: { in: inchargeEmails } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: principalEmails } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: correspondentEmails } }, select: { id: true } }),
    ]);

    await prisma.school.update({
      where: { id: school.id },
      data: {
        incharges: { set: inchargeUsers.map(u => ({ id: u.id })) },
        principals: { set: principalUsers.map(u => ({ id: u.id })) },
        correspondents: { set: correspondentUsers.map(u => ({ id: u.id })) },
      } as any,
    });

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
    const currentUsers = await getUsersBySchoolBasic(id);


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
  ATL_establishment_year: data.is_ATL ? (data.ATL_establishment_year ?? null) : null,
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

    // Process user associations
    await Promise.all([
      // 1. Remove school from users who are no longer associated
      ...currentUsers.map(async (user) => {
        if (!newUserEmails.has(user.email.toLowerCase().trim())) {
          await removeSchoolFromUserAndCleanup(user.id, id);
        }
      }),
      
      // 2. Add school to new/existing users
      ...[
        ...data.in_charges.map(u => ({ user: u, role: 'INCHARGE' as const })),
        ...data.principals.map(u => ({ user: u, role: 'PRINCIPAL' as const })),
        ...data.correspondents.map(u => ({ user: u, role: 'CORRESPONDENT' as const })),
  ].map(({user, role}) => addOrUpdateUserForSchoolRole(user, school.id, role)),
    ]);


    // Rebuild role-based relations on School to match latest emails
    const inchargeEmails = data.in_charges.map(u => u.email.toLowerCase().trim());
    const principalEmails = data.principals.map(u => u.email.toLowerCase().trim());
    const correspondentEmails = data.correspondents.map(u => u.email.toLowerCase().trim());

    const [inchargeUsers, principalUsers, correspondentUsers] = await Promise.all([
      prisma.user.findMany({ where: { email: { in: inchargeEmails } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: principalEmails } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: correspondentEmails } }, select: { id: true } }),
    ]);

    await prisma.school.update({
      where: { id: school.id },
      data: {
        incharges: { set: inchargeUsers.map(u => ({ id: u.id })) },
        principals: { set: principalUsers.map(u => ({ id: u.id })) },
        correspondents: { set: correspondentUsers.map(u => ({ id: u.id })) },
      } as any,
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

export async function getSchoolUsers(schoolId: string) {
  try {
    const users = await getUsersBySchoolWithMeta(schoolId);
    return users;
  } catch (error) {
    console.error(`Error fetching users for school ${schoolId}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: string) {
  const users = await getUsersBySchoolWithMeta(id);

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

    // Update the user using centralized helper instead of direct prisma call
    await updateUser(user.id, { schools: updatedSchools, user_meta_data: newMeta as any });
      if (updatedSchools.length === 0) { await removeSchoolFromUserAndCleanup(user.id, id); }
    })
  );

  // 3) Delete the school
  return prisma.school.delete({ where: { id } });
}
