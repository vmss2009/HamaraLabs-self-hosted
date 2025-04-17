import { prisma } from "../prisma";

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

// Handle user sign-in process
export const handleUserSignIn = async (id: string, email: string, userMetaData?: any) => {
    try {
        // Ensure the user exists in our database
        const user = await ensureUserExists(id, email, userMetaData);
        
        // You can add additional logic here, such as:
        // - Logging the sign-in
        // - Updating last sign-in timestamp
        // - Checking for any pending notifications
        // - etc.
        
        return user;
    } catch (error) {
        console.error("Error handling user sign-in:", error);
        throw error;
    }
};