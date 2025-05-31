import { prisma } from "@/lib/db/prisma";
import { SchoolCreateInput, SchoolFilter, SchoolWithAddress } from "../type";
import { Prisma } from "@prisma/client";
import { schoolSchema } from "../type";

export interface SchoolUpdateInput {
  name?: string;
  is_ATL?: boolean;
  in_charge?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  correspondent?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  principal?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  syllabus?: string[];
  website_url?: string | null;
  paid_subscription?: boolean;
  social_links?: string[];
}


// Step 2: Function to create school with validation
export async function createSchool(data: unknown): Promise<SchoolWithAddress> {
  try {
    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const validatedData = result.data;

    const formattedData: Prisma.SchoolCreateInput = {
      name: validatedData.name,
      is_ATL: validatedData.is_ATL,
      address: { connect: { id: validatedData.addressId } }, // 💡 connects Address
      in_charge: validatedData.in_charge ?? Prisma.JsonNull,
      correspondent: validatedData.correspondent ?? Prisma.JsonNull,
      principal: validatedData.principal ?? Prisma.JsonNull,
      syllabus: validatedData.syllabus,
      website_url: validatedData.website_url || null,
      paid_subscription: validatedData.paid_subscription,
      social_links: validatedData.social_links || []
    };

    const school = await prisma.school.create({
      data: formattedData,
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
        }
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
        }
      }
    }) as unknown as SchoolWithAddress[];
    
    return schools;
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
        }
      }
    }) as unknown as SchoolWithAddress | null;
    
    if (school) {
      // Parse JSON fields
      school.in_charge = school.in_charge ? JSON.parse(school.in_charge as string) : null;
      school.correspondent = school.correspondent ? JSON.parse(school.correspondent as string) : null;
      school.principal = school.principal ? JSON.parse(school.principal as string) : null;
    }
    
    return school;
  } catch (error) {
    console.error(`Error fetching school with id ${id}:`, error);
    throw error;
  }
}

export async function updateSchool(id: number, data: SchoolUpdateInput): Promise<SchoolWithAddress> {
  try {
    // Validate the input using Zod
    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const validatedData = result.data;

    // Prepare update payload
    const updateData: Prisma.SchoolUpdateInput = {
      ...validatedData,
      in_charge: validatedData.in_charge === null ? Prisma.JsonNull : validatedData.in_charge,
      correspondent: validatedData.correspondent === null ? Prisma.JsonNull : validatedData.correspondent,
      principal: validatedData.principal === null ? Prisma.JsonNull : validatedData.principal,
    };

    const school = await prisma.school.update({
      where: { id },
      data: updateData,
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
        }
      }
    }) as unknown as SchoolWithAddress;

    // JSON parse if needed — only if your type expects it
    if (school) {
      school.in_charge = typeof school.in_charge === "string" ? JSON.parse(school.in_charge) : school.in_charge;
      school.correspondent = typeof school.correspondent === "string" ? JSON.parse(school.correspondent) : school.correspondent;
      school.principal = typeof school.principal === "string" ? JSON.parse(school.principal) : school.principal;
    }

    return school;
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