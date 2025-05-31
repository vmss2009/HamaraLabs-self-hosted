import { prisma } from "../prisma";

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: { email },
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const ensureUserExists = async (
  id: string,
  email: string,
  userMetaData?: any
) => {
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
      console.log(`Created new user: ${email}`);
    } else {
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

export const handleUserSignIn = async (
  id: string,
  email: string,
  userMetaData?: any
) => {
  try {
    const user = await ensureUserExists(id, email, userMetaData);

    return user;
  } catch (error) {
    console.error("Error handling user sign-in:", error);
    throw error;
  }
};
