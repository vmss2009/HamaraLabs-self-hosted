import { prisma } from "@/lib/db/prisma";
import { CountryCreateInput, StateCreateInput, CityCreateInput } from "../type";

export async function createCountry(data: CountryCreateInput) {
  try {
    const country = await prisma.country.create({
      data: {
        country_name: data.country_name,
      },
    });

    return country;
  } catch (error) {
    console.error("Error creating country:", error);
    throw error;
  }
}

export async function getCountries() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: {
        country_name: "asc",
      },
    });

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}

export async function createState(data: StateCreateInput) {
  try {
    const state = await prisma.state.create({
      data: {
        state_name: data.state_name,
        country_id: data.countryId,
      },
    });

    return state;
  } catch (error) {
    console.error("Error creating state:", error);
    throw error;
  }
}

export async function getStatesByCountry(countryId: number) {
  try {
    const states = await prisma.state.findMany({
      where: {
        country_id: countryId,
      },
      include: {
        country: true,
      },
      orderBy: {
        state_name: "asc",
      },
    });

    return states;
  } catch (error) {
    console.error(`Error fetching states for country ${countryId}:`, error);
    throw error;
  }
}

export async function createCity(data: CityCreateInput) {
  try {
    const city = await prisma.city.create({
      data: {
        city_name: data.city_name,
        state_id: data.stateId,
      },
    });

    return city;
  } catch (error) {
    console.error("Error creating city:", error);
    throw error;
  }
}

export async function getCitiesByState(stateId: number) {
  try {
    const cities = await prisma.city.findMany({
      where: {
        state_id: stateId,
      },
      include: {
        state: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        city_name: "asc",
      },
    });

    return cities;
  } catch (error) {
    console.error(`Error fetching cities for state ${stateId}:`, error);
    throw error;
  }
}
