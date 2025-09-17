import { prisma } from "../prisma";
import { User, Prisma } from "@prisma/client";

export const getUserByEmail = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email }
    });
};

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

type UserMeta = Prisma.InputJsonValue;

export const ensureUserExists = async (id: string, email: string, userMetaData?: UserMeta) => {
    try {
        let user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id,
                    email,
                    user_meta_data: userMetaData || {},
                },
            });
        } else {
            if (userMetaData) {
                user = await prisma.user.update({
                    where: { id },
                    data: {
                        user_meta_data: userMetaData,
                    },
                });
            }
        }

        return user;
    } catch (error) {
        console.error("Error ensuring user exists:", error);
        throw error;
    }
};

export const updateUserMetadata = async (id: string, userMetaData: UserMeta) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: {
                user_meta_data: userMetaData,
            },
        });
    } catch (error) {
        console.error("Error updating user metadata:", error);
        throw error;
    }
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

export async function createUser(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  user_meta_data?: UserMeta;
}): Promise<User> {
  return prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      ...data,
    },
  });
}

export async function updateUser(id: string, data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  user_meta_data?: UserMeta;
}): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id },
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