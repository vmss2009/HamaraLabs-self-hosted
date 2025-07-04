import { prisma } from "@/lib/db/prisma";
import {
  SchoolCreateInput,
  SchoolFilter,
  SchoolUpdateInput,
  SchoolWithAddress,
} from "../type";
import { v4 as uuidv4 } from "uuid";

export async function createSchool(data: SchoolCreateInput): Promise<SchoolWithAddress> {
  try {
    const existingInCharge = data.in_charge
      ? await prisma.user.findUnique({
          where: { email: data.in_charge.email },
        })
      : null;

    const existingPrincipal = data.principal
      ? await prisma.user.findUnique({
          where: { email: data.principal.email },
        })
      : null;

    const existingCorrespondent = data.correspondent
      ? await prisma.user.findUnique({
          where: { email: data.correspondent.email },
        })
      : null;

    const in_charge = data.in_charge
      ? existingInCharge
        ? await prisma.user.update({
            where: { id: existingInCharge.id },
            data: {
              first_name: data.in_charge.first_name,
              last_name: data.in_charge.last_name,
              user_meta_data: {
                phone_number: data.in_charge.phone_number,
                ...data.in_charge.user_meta_data,
              },
            },
          })
        : await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.in_charge.email,
              first_name: data.in_charge.first_name,
              last_name: data.in_charge.last_name,
              user_meta_data: {
                phone_number: data.in_charge.phone_number,
                ...data.in_charge.user_meta_data,
              },
            },
          })
      : null;

    const principal = data.principal
      ? existingPrincipal
        ? await prisma.user.update({
            where: { id: existingPrincipal.id },
            data: {
              first_name: data.principal.first_name,
              last_name: data.principal.last_name,
              user_meta_data: {
                phone_number: data.principal.phone_number,
                ...data.principal.user_meta_data,
              },
            },
          })
        : await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.principal.email,
              first_name: data.principal.first_name,
              last_name: data.principal.last_name,
              user_meta_data: {
                phone_number: data.principal.phone_number,
                ...data.principal.user_meta_data,
              },
            },
          })
      : null;

    const correspondent = data.correspondent
      ? data.correspondent.email === data.principal?.email
        ? principal
        : existingCorrespondent
        ? await prisma.user.update({
            where: { id: existingCorrespondent.id },
            data: {
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: {
                phone_number: data.correspondent.phone_number,
                ...data.correspondent.user_meta_data,
              },
            },
          })
        : await prisma.user.create({
            data: {
              id: uuidv4(),
              email: data.correspondent.email,
              first_name: data.correspondent.first_name,
              last_name: data.correspondent.last_name,
              user_meta_data: {
                phone_number: data.correspondent.phone_number,
                ...data.correspondent.user_meta_data,
              },
            },
          })
      : null;

    const school = await prisma.school.create({
      data: {
        name: data.name,
        is_ATL: data.is_ATL,
        ATL_establishment_year: data.ATL_establishment_year,
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
            ...(principal ? [{ id: principal.id }] : []),
          ].filter(
            (user, index, self) =>
              index === self.findIndex((u) => u.id === user.id)
          ),
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
    console.error("Error creating school:", error);
    throw error;
  }
}

export async function getSchools(filter?: SchoolFilter): Promise<SchoolWithAddress[]> {
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

    return school
      ? {
          ...school,
          id: school.id.toString(),
        }
      : null;
  } catch (error) {
    console.error(`Error fetching school with id ${id}:`, error);
    throw error;
  }
}

export async function updateSchool(id: string, data: SchoolUpdateInput): Promise<SchoolWithAddress> {
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
      const previousPrincipal = currentSchool.users?.find(
        (user) => user.id === currentSchool.principal_id
      );

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
      if (data.correspondent.email === data.principal?.email) {
        correspondentId = principalId;
      } else {
        const previousCorrespondent = currentSchool.users?.find(
          (user) => user.id === currentSchool.correspondent_id
        );

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
      const previousInCharge = currentSchool.users?.find(
        (user) => user.id === currentSchool.in_charge_id
      );

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

export async function deleteSchool(id: string) {
  return prisma.school.delete({
    where: { id },
  });
}
