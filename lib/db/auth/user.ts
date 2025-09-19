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

export async function createUser(data: {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_meta_data?: UserMeta;
    schools?: string[];
}): Promise<User> {
    const { id, email, first_name, last_name, user_meta_data, schools } = data;
    return prisma.user.create({
        data: {
            id: id ?? crypto.randomUUID(),
            email,
            first_name,
            last_name,
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
