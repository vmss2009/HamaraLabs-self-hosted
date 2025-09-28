import { prisma } from "../prisma";
import { User, Prisma } from "@prisma/client";
import { createAuthentikUser, updateAuthentikUserByEmail, deleteAuthentikUserByEmail } from "./authentik";

type UserMeta = Prisma.InputJsonValue;

export const getUserByEmail = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email }
    });
};

export const checkRole = (dbUser: User, role: string): boolean => {
    const meta: any = dbUser.user_meta_data || {};
    const rbs = meta.rolesBySchool || {};
    console.log(meta);
    if (rbs && typeof rbs === 'object') {
        for (const key of Object.keys(rbs)) {
            const raw = rbs[key];
            const arr = Array.isArray(raw) ? raw : [raw];
            if (arr.some((r: any) => String(r).toUpperCase() === role.toUpperCase())) {
                return true;
            }
        }
    }
    return false;
};

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
        // Fetch all users associated with this school
        const users = await prisma.user.findMany({
            where: {
                schools: { has: schoolId },
            },
        });

        // Determine their primary role for this school from rolesBySchool in user_meta_data
        const priority = ["INCHARGE", "PRINCIPAL", "CORRESPONDENT"] as const;

        const result = users.map((user) => {
            const meta: any = user.user_meta_data ?? {};
            const rolesBySchool = meta?.rolesBySchool ?? {};
            const raw = rolesBySchool?.[schoolId] ?? [];
            const roles: string[] = Array.isArray(raw) ? raw : [raw];

            // Normalize to uppercase for comparison
            const normalized = roles
                .filter(Boolean)
                .map((r) => String(r).toUpperCase());

            const picked = priority.find((p) => normalized.includes(p));

            const roleLabel = picked === "INCHARGE"
                ? "Incharge"
                : picked === "PRINCIPAL"
                ? "Principal"
                : picked === "CORRESPONDENT"
                ? "Correspondent"
                : "";

            return {
                ...user,
                role: roleLabel,
            } as User & { role: string };
        });

        return result;
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
  const created = await prisma.user.create({
    data: {
      id: id ?? crypto.randomUUID(),
      email,
      ...(fn ? { first_name: fn } : {}),
      ...(ln ? { last_name: ln } : {}),
      user_meta_data,
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
