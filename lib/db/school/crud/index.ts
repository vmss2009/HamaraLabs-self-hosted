import { prisma } from "@/lib/db/prisma";
import {
  SchoolCreateInput,
  SchoolFilter,
  SchoolUpdateInput,
  SchoolWithAddress,
  UserInput,
} from "../type";
import type { Prisma } from "@prisma/client";
import { createUser, updateUser, deleteUser, syncDerivedRolesForUsers } from "@/lib/db/auth/user";
import { normalizeEmail } from "@/lib/db/shared/email";

type UserMeta = Prisma.InputJsonValue;

async function getUsersBySchoolWithMeta(school_id: string): Promise<Array<{ id: string; email: string; first_name: string | null; last_name: string | null; schools: string[]; user_meta_data: Prisma.JsonValue | null }>> {
    return prisma.user.findMany({
        where: { schools: { has: school_id } },
    select: { id: true, email: true, first_name: true, last_name: true, schools: true, user_meta_data: true },
    });
}

async function addOrUpdateUserForSchool(userData: UserInput, schoolId: string) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });

    if (existingUser) {
        const updatedSchools = existingUser.schools.includes(schoolId)
            ? existingUser.schools
            : [...existingUser.schools, schoolId];

        const currentMeta = (existingUser.user_meta_data ?? {}) as Record<string, any>;

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
      } as UserMeta,
    });
}

/**
 * Throws if any email in `emails` already belongs to a school other than
 * `currentSchoolId`. Pass null for create (any existing school is a conflict).
 * Within-school multi-role is fine — same email, same school → passes.
 */
async function checkSingleSchoolConstraint(
  emails: string[],
  currentSchoolId: string | null,
): Promise<void> {
  const normalized = [...new Set(emails.map(normalizeEmail))];
  if (normalized.length === 0) return;

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: normalized, mode: "insensitive" } },
    select: { email: true, schools: true },
  });

  const conflicts: string[] = [];
  for (const user of existingUsers) {
    const otherSchoolIds = user.schools.filter((s) => s !== currentSchoolId);
    if (otherSchoolIds.length === 0) continue;

    const schools = await prisma.school.findMany({
      where: { id: { in: otherSchoolIds } },
      select: { name: true },
    });
    const names = schools.map((s) => s.name).join(", ");
    conflicts.push(`${user.email} is already associated with: ${names}`);
  }

  if (conflicts.length > 0) {
    throw new Error(
      `The following people are already linked to another school and cannot be added here:\n${conflicts.join("\n")}`,
    );
  }
}

async function cleanupOrphanedUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                students: true,
                mentors: true,
                school_visits: true,
                principalOf: { select: { id: true } },
                inchargeOf: { select: { id: true } },
                correspondentOf: { select: { id: true } },
            },
        });
        if (!user) return;
        if (
            user.schools.length === 0 &&
            user.students.length === 0 &&
            user.mentors.length === 0 &&
            user.school_visits.length === 0 &&
            user.principalOf.length === 0 &&
            user.inchargeOf.length === 0 &&
            user.correspondentOf.length === 0
        ) {
            await deleteUser(userId);
        }
    } catch (error) {
        console.error(`Error cleaning up user ${userId}:`, error);
    }
}


export async function createSchool(data: SchoolCreateInput): Promise<SchoolWithAddress> {
  try {
    const allEmails = [
      ...data.in_charges.map((u) => u.email),
      ...data.principals.map((u) => u.email),
      ...data.correspondents.map((u) => u.email),
    ];
    await checkSingleSchoolConstraint(allEmails, null);

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

    const allUsers: UserInput[] = [
      ...data.in_charges,
      ...data.principals,
      ...data.correspondents,
    ];

    await Promise.all(
      allUsers.map((u) => addOrUpdateUserForSchool(u, school.id))
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

    const touchedUserIds = Array.from(new Set([
      ...inchargeUsers.map(u => u.id),
      ...principalUsers.map(u => u.id),
      ...correspondentUsers.map(u => u.id),
    ]));
    await syncDerivedRolesForUsers(touchedUserIds);

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
      include: {
        incharges: { select: { id: true, email: true } },
        principals: { select: { id: true, email: true } },
        correspondents: { select: { id: true, email: true } },
      },
    });

    if (!currentSchool) {
      throw new Error("School not found");
    }

    const allEmails = [
      ...data.in_charges.map((u) => u.email),
      ...data.principals.map((u) => u.email),
      ...data.correspondents.map((u) => u.email),
    ];
    await checkSingleSchoolConstraint(allEmails, id);

    // Deduplicated map of current role-holder id -> email (a user can hold multiple roles)
    const currentRoleUsers = new Map<string, string>();
    for (const u of [
      ...currentSchool.incharges,
      ...currentSchool.principals,
      ...currentSchool.correspondents,
    ]) {
      currentRoleUsers.set(u.id, u.email);
    }

    // Emails that will be in at least one role after the update
    const newRoleEmails = new Set([
      ...data.in_charges.map(u => normalizeEmail(u.email)),
      ...data.principals.map(u => normalizeEmail(u.email)),
      ...data.correspondents.map(u => normalizeEmail(u.email)),
    ]);

    // Users dropped from every role they held at this school
    const removedUserIds = [...currentRoleUsers.entries()]
      .filter(([, email]) => !newRoleEmails.has(normalizeEmail(email)))
      .map(([uid]) => uid);

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
                  include: { country: true },
                },
              },
            },
          },
        },
      },
    });

    // Upsert all new role holders (creates account or adds this school to their schools array)
    await Promise.all(
      [...data.in_charges, ...data.principals, ...data.correspondents].map(u =>
        addOrUpdateUserForSchool(u, school.id)
      )
    );

    // Rebuild role relation tables — must happen BEFORE cleanup so that
    // cleanupOrphanedUser sees the final state of principalOf/inchargeOf/correspondentOf.
    const inchargeEmails = data.in_charges.map(u => normalizeEmail(u.email));
    const principalEmails = data.principals.map(u => normalizeEmail(u.email));
    const correspondentEmails = data.correspondents.map(u => normalizeEmail(u.email));

    const [inchargeUsers, principalUsers, correspondentUsers] = await Promise.all([
      prisma.user.findMany({ where: { email: { in: inchargeEmails, mode: "insensitive" } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: principalEmails, mode: "insensitive" } }, select: { id: true } }),
      prisma.user.findMany({ where: { email: { in: correspondentEmails, mode: "insensitive" } }, select: { id: true } }),
    ]);

    await prisma.school.update({
      where: { id: school.id },
      data: {
        incharges: { set: inchargeUsers.map(u => ({ id: u.id })) },
        principals: { set: principalUsers.map(u => ({ id: u.id })) },
        correspondents: { set: correspondentUsers.map(u => ({ id: u.id })) },
      } as any,
    });

    // Now remove this school from dropped users' schools array
    await Promise.all(
      removedUserIds.map(async (userId) => {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { schools: true } });
        if (!user) return;
        await updateUser(userId, { schools: user.schools.filter(s => s !== id) });
      })
    );

    // Sync roles then safely clean up users who no longer have any role anywhere
    const allTouchedIds = Array.from(new Set([
      ...currentRoleUsers.keys(),
      ...inchargeUsers.map(u => u.id),
      ...principalUsers.map(u => u.id),
      ...correspondentUsers.map(u => u.id),
    ]));
    await syncDerivedRolesForUsers(allTouchedIds);
    await Promise.all(removedUserIds.map(userId => cleanupOrphanedUser(userId)));

    return { ...school, id: school.id.toString() };
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}

export type SchoolUserEntry = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
};

export type SchoolUsersGrouped = {
  incharges: SchoolUserEntry[];
  principals: SchoolUserEntry[];
  correspondents: SchoolUserEntry[];
};

function toEntry(u: {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_meta_data: Prisma.JsonValue | null;
}): SchoolUserEntry {
  const meta = (u.user_meta_data as Record<string, unknown> | null) ?? {};
  const phone = typeof (meta as any).phone_number === "string"
    ? ((meta as any).phone_number as string)
    : null;
  return {
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    phone_number: phone,
  };
}

export async function getSchoolUsers(schoolId: string): Promise<SchoolUsersGrouped> {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        incharges: {
          select: { id: true, email: true, first_name: true, last_name: true, user_meta_data: true },
        },
        principals: {
          select: { id: true, email: true, first_name: true, last_name: true, user_meta_data: true },
        },
        correspondents: {
          select: { id: true, email: true, first_name: true, last_name: true, user_meta_data: true },
        },
      },
    });
    if (!school) return { incharges: [], principals: [], correspondents: [] };
    return {
      incharges: school.incharges.map(toEntry),
      principals: school.principals.map(toEntry),
      correspondents: school.correspondents.map(toEntry),
    };
  } catch (error) {
    console.error(`Error fetching users for school ${schoolId}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: string) {
  const users = await getUsersBySchoolWithMeta(id);

  // Delete school first: the CASCADE on _SchoolPrincipals/_SchoolIncharges/
  // _SchoolCorrespondents removes M2M role rows so that cleanupOrphanedUser
  // sees reality (no stale principalOf/inchargeOf/correspondentOf entries).
  const deleted = await prisma.school.delete({ where: { id } });

  // Remove this school from each user's schools array
  await Promise.all(
    users.map(async (user) => {
      const updatedSchools = user.schools.filter((sid) => sid !== id);
      await updateUser(user.id, { schools: updatedSchools });
    })
  );

  // Sync roles then safely delete users who have no remaining roles anywhere
  await syncDerivedRolesForUsers(users.map(u => u.id));
  await Promise.all(users.map(user => cleanupOrphanedUser(user.id)));

  return deleted;
}
