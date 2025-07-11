import { prisma } from "@/lib/db/prisma";
import { v4 as uuidv4 } from 'uuid';
import { MentorCreateInput, MentorFilter, MentorUpdateInput } from "../type";
import { Prisma } from "@prisma/client";

export async function createMentor(data: MentorCreateInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        user_meta_data: data.user_meta_data || {},
        schools: {
          connect: data.school_ids.map(id => ({ id }))
        }
      },
      include: {
        schools: true
      }
    });

    return user;
  } catch (error) {
    console.error("Error creating mentor:", error);
    throw error;
  }
}

export async function getMentors(filter?: MentorFilter) {
  try {
    const where: Prisma.UserWhereInput = {
      ...(filter?.name && {
        OR: [
          { first_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } },
          { last_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      ...(filter?.email && { email: { contains: filter.email, mode: Prisma.QueryMode.insensitive } }),
      ...(filter?.schoolId && {
        schools: {
          some: {
            id: filter.schoolId
          }
        }
      })
    };

    const mentors = await prisma.user.findMany({
      where,
      include: {
        schools: true
      }
    });

    return mentors;
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
}

export async function getMentorById(id: string) {
  try {
    const mentor = await prisma.user.findUnique({
      where: { id },
      include: {
        schools: true
      }
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    return mentor;
  } catch (error) {
    console.error("Error fetching mentor:", error);
    throw error;
  }
}

export async function updateMentor(id: string, data: MentorUpdateInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error("Mentor not found");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (emailExists) {
        throw new Error("A user with this email already exists");
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.email && { email: data.email }),
        ...(data.user_meta_data && { user_meta_data: data.user_meta_data }),
        ...(data.school_ids && {
          schools: {
            set: data.school_ids.map(id => ({ id }))
          }
        })
      },
      include: {
        schools: true
      }
    });

    return user;
  } catch (error) {
    console.error("Error updating mentor:", error);
    throw error;
  }
}

export async function deleteMentor(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        schools: {
          set: []
        }
      }
    });

    await prisma.user.delete({
      where: { id }
    });

    return true;
  } catch (error) {
    console.error("Error deleting mentor:", error);
    throw error;
  }
} 