import { prisma } from "@/lib/db/prisma";
import { v4 as uuidv4 } from 'uuid';
import { MentorCreateInput, MentorFilter, MentorUpdateInput, MentorWithUser } from "../type";
import { Prisma } from "@prisma/client";

async function createOrUpdateMentorUser(mentorData: MentorCreateInput, schoolIds: string[]) {
  console.log(`Creating/updating user for mentor email: ${mentorData.email}, schools: ${schoolIds}`);
  
  if (!mentorData.email || mentorData.email.trim() === "") {
    // No email provided, no user account needed
    return undefined;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: mentorData.email },
  });

  if (existingUser) {
    console.log(`Found existing user: ${existingUser.id}, current schools: ${existingUser.schools}`);
    // Add schools to existing user's schools array if not already present
    const updatedSchools = [...new Set([...existingUser.schools, ...schoolIds])];
    
    console.log(`Updated schools array for mentor: ${updatedSchools}`);
      
    return await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        first_name: mentorData.first_name,
        last_name: mentorData.last_name,
        schools: updatedSchools,
        user_meta_data: {
          phone_number: mentorData.phone_number,
        },
      },
    });
  } else {
    console.log(`Creating new user for mentor email: ${mentorData.email}`);
    return await prisma.user.create({
      data: {
        id: uuidv4(),
        email: mentorData.email,
        first_name: mentorData.first_name,
        last_name: mentorData.last_name,
        schools: schoolIds,
        user_meta_data: {
          phone_number: mentorData.phone_number,
        },
      },
    });
  }
}

export async function createMentor(data: MentorCreateInput): Promise<MentorWithUser> {
  try {
    console.log(`Creating mentor with data:`, data);
    
    let userId: string | undefined = undefined;

    // Create or update user if email is provided
    if (data.email && data.email.trim() !== "") {
      const user = await createOrUpdateMentorUser(data, data.school_ids);
      userId = user?.id;
    }

    const mentor = await prisma.mentor.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        school_ids: data.school_ids,
        comments: data.comments,
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    console.log(`Created mentor: ${mentor.id} with user: ${userId}`);
    return mentor;
  } catch (error) {
    console.error("Error creating mentor:", error);
    throw error;
  }
}

export async function getMentors(filter?: MentorFilter): Promise<MentorWithUser[]> {
  try {
    const where: Prisma.MentorWhereInput = {
      ...(filter?.name && {
        OR: [
          { first_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } },
          { last_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      ...(filter?.email && { email: { contains: filter.email, mode: Prisma.QueryMode.insensitive } }),
      ...(filter?.schoolId && {
        school_ids: {
          has: filter.schoolId
        }
      })
    };

    const mentors = await prisma.mentor.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        first_name: "asc",
      },
    });

    return mentors;
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
}

export async function getMentorById(id: string): Promise<MentorWithUser | null> {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    return mentor;
  } catch (error) {
    console.error("Error fetching mentor:", error);
    throw error;
  }
}

export async function updateMentor(id: string, data: MentorUpdateInput): Promise<MentorWithUser> {
  try {
    // Get current mentor to check if they have a user_id
    const currentMentor = await prisma.mentor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentMentor) {
      throw new Error("Mentor not found");
    }

    let userId: string | undefined = currentMentor.user_id || undefined;

    // Handle User record updates
    if (data.email && data.email.trim() !== "") {
      if (currentMentor.user_id) {
        // Update existing linked user
        const currentSchools = currentMentor.user?.schools || [];
        const updatedSchools = data.school_ids 
          ? [...new Set([...currentSchools.filter(schoolId => !currentMentor.school_ids.includes(schoolId)), ...data.school_ids])]
          : currentSchools;
          
        await prisma.user.update({
          where: { id: currentMentor.user_id },
          data: {
            email: data.email,
            first_name: data.first_name || currentMentor.first_name,
            last_name: data.last_name || currentMentor.last_name,
            schools: updatedSchools,
            user_meta_data: {
              phone_number: data.phone_number,
            },
          },
        });
      } else {
        // Check if user with new email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (existingUser) {
          // Add schools to existing user's schools array if not already present
          const updatedSchools = data.school_ids
            ? [...new Set([...existingUser.schools, ...data.school_ids])]
            : existingUser.schools;
            
          // Link to existing user and update their info
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              first_name: data.first_name || currentMentor.first_name,
              last_name: data.last_name || currentMentor.last_name,
              schools: updatedSchools,
              user_meta_data: {
                phone_number: data.phone_number,
              },
            },
          });
          userId = existingUser.id;
        } else {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.email,
              first_name: data.first_name || currentMentor.first_name,
              last_name: data.last_name || currentMentor.last_name,
              schools: data.school_ids || [],
              user_meta_data: {
                phone_number: data.phone_number,
              },
            },
          });
          userId = newUser.id;
        }
      }
    } else if (currentMentor.user_id) {
      // Email was removed - we could either keep the user or unlink
      // For now, let's unlink but keep the user record
      userId = undefined;
    }

    const updatedMentor = await prisma.mentor.update({
      where: { id },
      data: {
        first_name: data.first_name || currentMentor.first_name,
        last_name: data.last_name || currentMentor.last_name,
        email: data.email,
        phone_number: data.phone_number,
        school_ids: data.school_ids || currentMentor.school_ids,
        comments: data.comments,
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    return updatedMentor;
  } catch (error) {
    console.error(`Error updating mentor with id ${id}:`, error);
    throw error;
  }
}

export async function deleteMentor(id: string) {
  try {
    // Get mentor info before deletion to check if they have a linked user
    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    // Delete the mentor
    await prisma.mentor.delete({
      where: { id },
    });

    // Optional: If the user was created specifically for this mentor
    // and has no other roles/relationships, you might want to delete the user too
    // For now, we'll keep the user record but could add logic here to clean up
    // orphaned user records if needed
    
    return true;
  } catch (error) {
    console.error(`Error deleting mentor with id ${id}:`, error);
    throw error;
  }
}
