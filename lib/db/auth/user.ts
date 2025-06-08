import { prisma } from "../prisma";
import { User } from "@prisma/client";

// Fetch a user by email
export const getUserByEmail = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email }
    });
};

// Fetch a user by ID
export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

// Ensure a user exists in the database, create if not
export const ensureUserExists = async (id: string, email: string, userMetaData?: any) => {
    try {
        // First try to find the user
        let user = await prisma.user.findUnique({
            where: { id },
        });

        // If user does not exist, create a new one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id,
                    email,
                    user_meta_data: userMetaData || {},
                },
            });
            console.log(`Created new user: ${email}`);
        } else {
            // Update user metadata if provided
            if (userMetaData) {
                user = await prisma.user.update({
                    where: { id },
                    data: {
                        user_meta_data: userMetaData,
                    },
                });
                console.log(`Updated user metadata: ${email}`);
            }
        }

        return user;
    } catch (error) {
        console.error("Error ensuring user exists:", error);
        throw error;
    }
};

// Update user metadata
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

export async function getUsersBySchool(school_id: number): Promise<User[]> {
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