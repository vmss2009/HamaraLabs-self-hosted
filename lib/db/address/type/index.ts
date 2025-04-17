import { Address as PrismaAddress } from "@prisma/client";

export interface AddressCreateInput {
  address_line1?: string;
  address_line2?: string;
  pincode: string;
  cityId: number;
}

export interface AddressWithLocation extends PrismaAddress {
  city: {
    id: number;
    city_name: string;
    state: {
      id: number;
      state_name: string;
      country: {
        id: number;
        country_name: string;
      };
    };
  };
} 