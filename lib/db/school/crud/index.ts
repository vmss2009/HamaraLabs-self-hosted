import { prisma } from "@/lib/db/prisma";
import { SchoolCreateInput, SchoolFilter, SchoolWithAddress } from "../type";
import { Prisma } from "@prisma/client";

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

export async function createSchool(
  data: SchoolCreateInput
): Promise<SchoolWithAddress> {
  try {
    const school = (await prisma.school.create({
      data: {
        name: data.name,
        is_ATL: data.is_ATL,
        address_id: data.addressId,
        in_charge: Prisma.JsonNull,
        correspondent: Prisma.JsonNull,
        principal: Prisma.JsonNull,
        syllabus: data.syllabus,
        website_url: data.website_url,
        paid_subscription: data.paid_subscription,
        social_links: data.social_links,
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
      },
    })) as unknown as SchoolWithAddress;

    const in_charge = data.in_charge
      ? { ...data.in_charge, school_id: school.id }
      : null;
    const principal = data.principal
      ? { ...data.principal, school_id: school.id }
      : null;
    const correspondent = data.correspondent
      ? { ...data.correspondent, school_id: school.id }
      : null;

    const updatedSchool = (await prisma.school.update({
      where: { id: school.id },
      data: {
        in_charge: in_charge ?? Prisma.JsonNull,
        principal: principal ?? Prisma.JsonNull,
        correspondent: correspondent ?? Prisma.JsonNull,
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
      },
    })) as unknown as SchoolWithAddress;

    return updatedSchool;
  } catch (error) {
    console.error("Error creating school:", error);
    throw error;
  }
}

export async function getSchools(
  filter?: SchoolFilter
): Promise<SchoolWithAddress[]> {
  try {
    const where: any = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
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
        country: filter?.countryId ? { id: filter.countryId } : undefined,
      };
    }

    const schools = (await prisma.school.findMany({
      where,
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
      },
    })) as unknown as SchoolWithAddress[];

    return schools;
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function getSchoolById(
  id: number
): Promise<SchoolWithAddress | null> {
  try {
    const school = (await prisma.school.findUnique({
      where: { id },
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
      },
    })) as unknown as SchoolWithAddress | null;

    if (school) {
      school.in_charge = safeParseJson(school.in_charge);
      school.correspondent = safeParseJson(school.correspondent);
      school.principal = safeParseJson(school.principal);
    }

    return school;
  } catch (error) {
    console.error(`Error fetching school with id ${id}:`, error);
    throw error;
  }
}

function safeParseJson(json: unknown) {
  if (!json) return null;
  if (typeof json === "string") {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  return json;
}

export async function updateSchool(
  id: number,
  data: SchoolUpdateInput
): Promise<SchoolWithAddress> {
  try {
    const validatedData = data;

    const updateData: Prisma.SchoolUpdateInput = {
      ...validatedData,
      in_charge:
        validatedData.in_charge === null
          ? Prisma.JsonNull
          : validatedData.in_charge,
      correspondent:
        validatedData.correspondent === null
          ? Prisma.JsonNull
          : validatedData.correspondent,
      principal:
        validatedData.principal === null
          ? Prisma.JsonNull
          : validatedData.principal,
    };

    const school = (await prisma.school.update({
      where: { id },
      data: updateData,
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
      },
    })) as unknown as SchoolWithAddress;

    if (school) {
      school.in_charge =
        typeof school.in_charge === "string"
          ? JSON.parse(school.in_charge)
          : school.in_charge;
      school.correspondent =
        typeof school.correspondent === "string"
          ? JSON.parse(school.correspondent)
          : school.correspondent;
      school.principal =
        typeof school.principal === "string"
          ? JSON.parse(school.principal)
          : school.principal;
    }

    return school;
  } catch (error) {
    console.error(`Error updating school with id ${id}:`, error);
    throw error;
  }
}

export async function deleteSchool(id: number) {
  return prisma.school.delete({
    where: { id },
  });
}
