import { prisma } from "@/lib/db/prisma";
import { SchoolCreateInput, SchoolFilter, SchoolUpdateInput, SchoolWithAddress } from "../type";
import { v4 as uuidv4 } from 'uuid';

export async function createSchool(data: SchoolCreateInput): Promise<SchoolWithAddress> {
  try {
    // Create users first if provided
    const in_charge = data.in_charge ? await prisma.user.create({
      data: {
        id: uuidv4(),
        email: data.in_charge.email,
        first_name: data.in_charge.first_name,
        last_name: data.in_charge.last_name,
        user_meta_data: {
          phone_number: data.in_charge.phone_number,
          ...data.in_charge.user_meta_data
        }
      }
    }) : null;

    // Create principal first since correspondent might reuse it
    const principal = data.principal ? await prisma.user.create({
      data: {
        id: uuidv4(),
        email: data.principal.email,
        first_name: data.principal.first_name,
        last_name: data.principal.last_name,
        user_meta_data: {
          phone_number: data.principal.phone_number,
          ...data.principal.user_meta_data
        }
      }
    }) : null;

    // If correspondent is same as principal, use principal's record
    const correspondent = data.correspondent ? 
      (data.correspondent.email === data.principal?.email ? principal : await prisma.user.create({
        data: {
          id: uuidv4(),
          email: data.correspondent.email,
          first_name: data.correspondent.first_name,
          last_name: data.correspondent.last_name,
          user_meta_data: {
            phone_number: data.correspondent.phone_number,
            ...data.correspondent.user_meta_data
          }
        }
      })) : null;

    // Create the school with the created users
    const school = await prisma.school.create({
      data: {
        name: data.name,
        is_ATL: data.is_ATL,
        address_id: data.address_id,
        in_charge_id: in_charge?.id,
        correspondent_id: correspondent?.id,
        principal_id: principal?.id,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
        users: {
          connect: [
            ...(in_charge ? [{ id: in_charge.id }] : []),
            ...(correspondent ? [{ id: correspondent.id }] : []),
            ...(principal ? [{ id: principal.id }] : [])
          ].filter((user, index, self) => 
            // Remove duplicate user IDs (in case correspondent is same as principal)
            index === self.findIndex((u) => u.id === user.id)
          )
        }
      },
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

    return school;
  } catch (error) {
    console.error("Error creating school:", error);
    throw error;
  }
}

export async function getSchools(filter?: SchoolFilter): Promise<SchoolWithAddress[]> {
  try {
    const where: any = {};
    
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
    
    return schools as SchoolWithAddress[];
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function getSchoolById(id: number): Promise<SchoolWithAddress | null> {
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

export async function updateSchool(id: number, data: SchoolUpdateInput): Promise<SchoolWithAddress> {
  try {
    // Get current school data
    const currentSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!currentSchool) {
      throw new Error("School not found");
    }

    // Update address if provided
    if (data.address) {
      await prisma.address.update({
        where: { id: currentSchool.address_id },
        data: {
          address_line1: data.address.address_line1,
          address_line2: data.address.address_line2,
          pincode: data.address.pincode,
          city_id: data.address.city_id
        }
      });
    }

    // Handle principal user creation/update
    let principalId = undefined;
    if (data.principal) {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.principal.email }
      });

      if (existingUser) {
        // Use existing user
        principalId = existingUser.id;
        // Update user details
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            first_name: data.principal.first_name,
            last_name: data.principal.last_name,
            user_meta_data: data.principal.user_meta_data
          }
        });
      } else {
        // Create new user
        const newPrincipal = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: data.principal.email,
            first_name: data.principal.first_name,
            last_name: data.principal.last_name,
            user_meta_data: data.principal.user_meta_data
          }
        });
        principalId = newPrincipal.id;
      }
    }

    // Handle correspondent user creation/update
    let correspondentId = undefined;
    if (data.correspondent) {
      // Check if correspondent email matches principal email
      if (data.correspondent.email === data.principal?.email) {
        // If emails match, use principal's ID
        correspondentId = principalId;
      } else {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: data.correspondent.email }
        });

        if (existingUser) {
          // Use existing user
          correspondentId = existingUser.id;
          // Update user details
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: data.correspondent.user_meta_data
            }
          });
        } else {
          // Create new user
          const newCorrespondent = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.correspondent.email,
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: data.correspondent.user_meta_data
            }
          });
          correspondentId = newCorrespondent.id;
        }
      }
    }

    // Update the school
    const school = await prisma.school.update({
      where: { id },
      data: {
        name: data.name,
        is_ATL: data.is_ATL,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
        principal_id: principalId,
        correspondent_id: correspondentId,
        users: {
          connect: [
            ...(principalId ? [{ id: principalId }] : []),
            ...(correspondentId ? [{ id: correspondentId }] : [])
          ]
        }
      },
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
    
    return school as SchoolWithAddress;
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: number) {
  return prisma.school.delete({
    where: { id }
  });
} 