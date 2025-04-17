import { Country as PrismaCountry, State as PrismaState, City as PrismaCity } from "@prisma/client";

// Country types
export interface CountryCreateInput {
  country_name: string;
}

// State types
export interface StateCreateInput {
  state_name: string;
  countryId: number;
}

export interface StateWithCountry extends PrismaState {
  country: PrismaCountry;
}

// City types
export interface CityCreateInput {
  city_name: string;
  stateId: number;
}

export interface CityWithState extends PrismaCity {
  state: StateWithCountry;
} 