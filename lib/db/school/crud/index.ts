import { prisma } from "@/lib/db/prisma";
import { SchoolFilter, SchoolUpdateInput, SchoolWithAddress } from "../type";
import { v4 as uuidv4 } from 'uuid';
import { auth } from "@/lib/auth/auth";

export async function getSchools(filter?: SchoolFilter): Promise<SchoolWithAddress[]> {
  try {
    // Get the current user's session
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("No authenticated user found");
    }

    // Get the user with their associated schools
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { schools: { select: { id: true } } }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get the IDs of schools associated with the user
    const userSchoolIds = user.schools.map(school => school.id);

    // Build the where clause
    const where: any = {
      id: { in: userSchoolIds } // Only include schools associated with the user
    };
    
    if (filter?.name) {
      where.name = { contains: filter.name, mode: 'insensitive' };
    }
    
    if (filter?.is_ATL !== undefined) {
      where.is_ATL = filter.is_ATL;
    }
    
    if (filter?.paid_subscription !== undefined) {
      where.paid_subscription = filter.paid_subscription;
    }
    
    if (filter?.cityId || filter?.stateId || filter?.countryId) {
      where.address = {
        city: filter?.cityId ? { id: filter.cityId } : undefined,
        state: filter?.stateId ? { id: filter.stateId } : undefined,
        country: filter?.countryId ? { id: filter.countryId } : undefined
      };
    }
    
    const schools = await prisma.school.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
        users: true,
      },
    });

    return schools.map((school) => ({
      ...school,
      id: school.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function getSchoolById(id: string): Promise<SchoolWithAddress | null> {
  try {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true
                  }
                }
              }
            }
          }
        },
        users: true
      }
    });
    
    return school as SchoolWithAddress | null;
  } catch (error) {
    console.error(`Error fetching school with id ${id}:`, error);
    throw error;
  }
}

export async function updateSchool(id: string,data: SchoolUpdateInput): Promise<SchoolWithAddress> {
  try {
    const currentSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!currentSchool) {
      throw new Error("School not found");
    }

    if (data.address) {
      await prisma.address.update({
        where: { id: currentSchool.address_id },
        data: {
          address_line1: data.address.address_line1,
          address_line2: data.address.address_line2,
          pincode: data.address.pincode,
          city_id: data.address.city_id,
        },
      });
    }

    let principalId = undefined;
    if (data.principal) {
      // Get the previous principal's email if it exists
      const previousPrincipal = currentSchool.users?.find(
        (user) => user.id === currentSchool.principal_id
      );

      // If there was a previous principal and email has changed, remove school from their schools array
      if (
        previousPrincipal &&
        previousPrincipal.email !== data.principal.email
      ) {
        await prisma.user.update({
          where: { id: previousPrincipal.id },
          data: {
            schools: {
              disconnect: { id: id },
            },
          },
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.principal.email },
      });

      if (existingUser) {
        principalId = existingUser.id;
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            first_name: data.principal.first_name,
            last_name: data.principal.last_name,
            user_meta_data: data.principal.user_meta_data,
            schools: {
              connect: { id: id },
            },
          },
        });
      } else {
        const newPrincipal = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: data.principal.email,
            first_name: data.principal.first_name,
            last_name: data.principal.last_name,
            user_meta_data: data.principal.user_meta_data,
            schools: {
              connect: { id: id },
            },
          },
        });
        principalId = newPrincipal.id;
      }
    }

    let correspondentId = undefined;
    if (data.correspondent) {
      // If correspondent email is same as principal, use principal's ID
      if (data.correspondent.email === data.principal?.email) {
        correspondentId = principalId;
      } else {
        // Get the previous correspondent's email if it exists
        const previousCorrespondent = currentSchool.users?.find(
          (user) => user.id === currentSchool.correspondent_id
        );

        // If there was a previous correspondent and email has changed, remove school from their schools array
        if (
          previousCorrespondent &&
          previousCorrespondent.email !== data.correspondent.email
        ) {
          await prisma.user.update({
            where: { id: previousCorrespondent.id },
            data: {
              schools: {
                disconnect: { id: id },
              },
            },
          });
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: data.correspondent.email },
        });

        if (existingUser) {
          correspondentId = existingUser.id;
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: data.correspondent.user_meta_data,
              schools: {
                connect: { id: id },
              },
            },
          });
        } else {
          // Create new user
          const newCorrespondent = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.correspondent.email,
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: data.correspondent.user_meta_data,
              schools: {
                connect: { id: id },
              },
            },
          });
          correspondentId = newCorrespondent.id;
        }
      }
    }

    let inChargeId = undefined;
    if (data.in_charge) {
      // Get the previous in-charge's email if it exists
      const previousInCharge = currentSchool.users?.find(
        (user) => user.id === currentSchool.in_charge_id
      );

      // If there was a previous in-charge and email has changed, remove school from their schools array
      if (previousInCharge && previousInCharge.email !== data.in_charge.email) {
        await prisma.user.update({
          where: { id: previousInCharge.id },
          data: {
            schools: {
              disconnect: { id: id },
            },
          },
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.in_charge.email },
      });

      if (existingUser) {
        inChargeId = existingUser.id;
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            first_name: data.in_charge.first_name,
            last_name: data.in_charge.last_name,
            user_meta_data: data.in_charge.user_meta_data,
            schools: {
              connect: { id: id },
            },
          },
        });
      } else {
        const newInCharge = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: data.in_charge.email,
            first_name: data.in_charge.first_name,
            last_name: data.in_charge.last_name,
            user_meta_data: data.in_charge.user_meta_data,
            schools: {
              connect: { id: id },
            },
          },
        });
        inChargeId = newInCharge.id;
      }
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        name: data.name,
        is_ATL: data.is_ATL,
        ATL_establishment_year: data.ATL_establishment_year,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
        principal_id: principalId,
        correspondent_id: correspondentId,
        in_charge_id: inChargeId,
        users: {
          connect: [
            ...(principalId ? [{ id: principalId }] : []),
            ...(correspondentId ? [{ id: correspondentId }] : []),
            ...(inChargeId ? [{ id: inChargeId }] : []),
          ],
        },
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
        users: true,
      },
    });

    return {
      ...school,
      id: school.id.toString(),
    };
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}
