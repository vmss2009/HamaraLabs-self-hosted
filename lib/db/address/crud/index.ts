import { prisma } from "@/lib/db/prisma";
import { AddressCreateInput, AddressWithLocation } from "../type";

export interface AddressUpdateInput {
  address_line1?: string;
  address_line2?: string;
  pincode?: string;
  cityId?: number;
}

export async function createAddress(data: AddressCreateInput) {
  try {
    const address = await prisma.address.create({
      data: {
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        pincode: data.pincode,
        city_id: data.cityId,
      },
    });

    return address;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
}

export async function getAddressById(
  id: number,
): Promise<AddressWithLocation | null> {
  try {
    const address = await prisma.address.findUnique({
      where: { id },
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
    });

    return address as AddressWithLocation | null;
  } catch (error) {
    console.error(`Error fetching address with id ${id}:`, error);
    throw error;
  }
}

export async function updateAddress(id: number, data: AddressUpdateInput) {
  return prisma.address.update({
    where: { id },
    data: {
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      pincode: data.pincode,
      city_id: data.cityId,
    },
  });
}

export async function deleteAddress(id: number) {
  return prisma.address.delete({
    where: { id },
  });
}
