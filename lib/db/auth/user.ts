import { prisma } from "../prisma";
import { User, Prisma } from "@prisma/client";

type UserMeta = Prisma.InputJsonValue;

export const getUserByEmail = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email }
    });
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
    return prisma.user.create({
        data: {
            id: id ?? crypto.randomUUID(),
            email,
      ...(fn ? { first_name: fn } : {}),
      ...(ln ? { last_name: ln } : {}),
            user_meta_data,
            schools: schools ?? [],
        },
    });
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
  return prisma.user.update({
    where: { id },
    data: patch,
  });
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id },
  });
}
