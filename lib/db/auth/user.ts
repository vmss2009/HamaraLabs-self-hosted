import { prisma } from "../prisma";
import { User, Prisma } from "@prisma/client";
import { createAuthentikUser, updateAuthentikUserByEmail, deleteAuthentikUserByEmail } from "./authentik";

type UserMeta = Prisma.InputJsonValue;

export const getUserByEmail = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email }
    });
};

export const isAdminUser = (dbUser: Pick<User, "user_meta_data">): boolean => {
    const meta = dbUser.user_meta_data as Record<string, unknown> | null;
    return Boolean(meta && (meta as { isAdmin?: unknown }).isAdmin === true);
};

export const checkRole = (dbUser: Pick<User, "roles">, role: string): boolean => {
    return (dbUser.roles ?? []).some(
        (r) => r.toLowerCase() === role.toLowerCase(),
    );
};

const DERIVED_ROLES = new Set([
    "principal",
    "incharge",
    "correspondent",
    "mentor",
    "student",
]);

export async function syncDerivedRoles(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            roles: true,
            principalOf: { select: { id: true } },
            inchargeOf: { select: { id: true } },
            correspondentOf: { select: { id: true } },
            mentors: { select: { id: true } },
            students: { select: { id: true } },
        },
    });
    if (!user) return [];

    const derived = new Set<string>();
    if (user.principalOf.length > 0) derived.add("principal");
    if (user.inchargeOf.length > 0) derived.add("incharge");
    if (user.correspondentOf.length > 0) derived.add("correspondent");
    if (user.mentors.length > 0) derived.add("mentor");
    if (user.students.length > 0) derived.add("student");

    const preserved = user.roles.filter((r) => !DERIVED_ROLES.has(r));
    const next = Array.from(new Set([...preserved, ...derived])).sort();

    const current = [...user.roles].sort();
    if (
        current.length === next.length &&
        current.every((r, i) => r === next[i])
    ) {
        return user.roles;
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { roles: { set: next } },
        select: { roles: true },
    });
    return updated.roles;
}

export async function syncDerivedRolesForUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((id) => syncDerivedRoles(id)));
}

export async function getUsersBySchool(school_id: string): Promise<User[]> {
  return prisma.user.findMany({
    where: {
        schools: {
            has: school_id,
        },
    }
  });
}

export async function getSchoolKeyUsers(schoolId: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: {
                incharges: true,
                principals: true,
                correspondents: true,
            },
        });
        if (!school) return [];

        const labelByUserId = new Map<string, string>();
        for (const u of school.principals) labelByUserId.set(u.id, "Principal");
        for (const u of school.correspondents) {
            if (!labelByUserId.has(u.id)) labelByUserId.set(u.id, "Correspondent");
        }
        for (const u of school.incharges) {
            if (!labelByUserId.has(u.id)) labelByUserId.set(u.id, "Incharge");
        }

        const ids = Array.from(labelByUserId.keys());
        if (ids.length === 0) return [];

        const users = await prisma.user.findMany({ where: { id: { in: ids } } });
        return users.map((user) => ({
            ...user,
            role: labelByUserId.get(user.id) ?? "",
        })) as Array<User & { role: string }>;
    } catch (error) {
        console.error("Error fetching school key users:", error);
        throw error;
    }
}

export async function createUser(data: {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_meta_data?: UserMeta;
    schools?: string[];
}): Promise<User> {
  const { id, email, user_meta_data, schools } = data;
  const fn = typeof data.first_name === 'string' ? data.first_name.trim() : undefined;
  const ln = typeof data.last_name === 'string' ? data.last_name.trim() : undefined;

  const baseMeta = { isAdmin: false } as Record<string, unknown>;
  const callerMeta =
    user_meta_data && typeof user_meta_data === 'object' && !Array.isArray(user_meta_data)
      ? (user_meta_data as Record<string, unknown>)
      : {};
  const mergedMeta = { ...baseMeta, ...callerMeta } as UserMeta;

  const created = await prisma.user.create({
    data: {
      id: id ?? crypto.randomUUID(),
      email,
      ...(fn ? { first_name: fn } : {}),
      ...(ln ? { last_name: ln } : {}),
      user_meta_data: mergedMeta,
      schools: schools ?? [],
    },
  });

  // Best-effort sync to Authentik; do not block on failure
  try {
    await createAuthentikUser({
      email: created.email,
      first_name: created.first_name ?? undefined,
      last_name: created.last_name ?? undefined,
      password: `${created.email}@789`,
    });
  } catch (e) {
    console.error("Failed to sync create to Authentik:", e);
  }

  return created;
}

export async function updateUser(id: string, data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    user_meta_data?: UserMeta;
    schools?: string[];
}): Promise<User> {
  const patch: any = { ...data };
  if (typeof data.first_name === 'string') {
    const fn = data.first_name.trim();
    if (fn) patch.first_name = fn; else delete patch.first_name;
  }
  if (typeof data.last_name === 'string') {
    const ln = data.last_name.trim();
    if (ln) patch.last_name = ln; else delete patch.last_name;
  }

  const prev = await prisma.user.findUnique({ where: { id } });
  const updated = await prisma.user.update({
    where: { id },
    data: patch,
  });

  // Best-effort sync to Authentik, comparing with previous email if present
  try {
    const oldEmail = prev?.email ?? updated.email;
    await updateAuthentikUserByEmail(oldEmail, {
      email: updated.email,
      first_name: updated.first_name ?? undefined,
      last_name: updated.last_name ?? undefined,
    });
  } catch (e) {
    console.error("Failed to sync update to Authentik:", e);
  }

  return updated;
}

export async function deleteUser(id: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { id } });
  const deleted = await prisma.user.delete({
    where: { id },
  });

  // Best-effort deletion in Authentik by email
  try {
    if (existing?.email) {
      await deleteAuthentikUserByEmail(existing.email);
    }
  } catch (e) {
    console.error("Failed to sync delete to Authentik:", e);
  }

  return deleted;
}
