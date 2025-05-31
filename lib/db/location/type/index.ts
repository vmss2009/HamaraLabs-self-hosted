import {
  Country as PrismaCountry,
  State as PrismaState,
  City as PrismaCity,
} from "@prisma/client";

export interface CountryCreateInput {
  country_name: string;
}

export interface StateCreateInput {
  state_name: string;
  countryId: number;
}

export interface StateWithCountry extends PrismaState {
  country: PrismaCountry;
}

export interface CityCreateInput {
  city_name: string;
  stateId: number;
}

export interface CityWithState extends PrismaCity {
  state: StateWithCountry;
}
