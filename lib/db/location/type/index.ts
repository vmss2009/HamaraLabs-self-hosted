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

export type Country = {
  id: number;
  country_name: string;
};

export type State = {
  id: number;
  state_name: string;
  countryId: number;
};

export type City = {
  id: number;
  city_name: string;
  stateId: number;
};
