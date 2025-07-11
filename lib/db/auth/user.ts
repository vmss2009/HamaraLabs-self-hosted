import { prisma } from "../prisma";
import { User } from "@prisma/client";

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

export const ensureUserExists = async (id: string, email: string, userMetaData?: any) => {
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

export const updateUserMetadata = async (id: string, userMetaData: any) => {
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
        some: {
          id: school_id
        }
      }
    }
  });
}

export async function createUser(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  user_meta_data?: any;
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
  user_meta_data?: any;
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
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                in_charge_id: true,
                correspondent_id: true,
                principal_id: true
            }
        });

        if (!school) {
            throw new Error("School not found");
        }

        const userIds = [
            school.in_charge_id,
            school.correspondent_id,
            school.principal_id
        ].filter((id): id is string => id !== null);

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });

        return users.map(user => ({
            ...user,
            role: user.id === school.in_charge_id ? 'Incharge' :
                  user.id === school.correspondent_id ? 'Correspondent' :
                  user.id === school.principal_id ? 'Principal' : ''
        }));
    } catch (error) {
        console.error("Error fetching school key users:", error);
        throw error;
    }
}