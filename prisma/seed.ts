import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { countries } from "countries-list";

const prisma = new PrismaClient();

const INDIA_ISO2 = "IN";

async function main() {
    const countryEntries = Object.values(countries).map((country) => ({
    country_name: country.name,
  }));

  for (const entry of countryEntries) {
    try {
      await prisma.country.create({
        data: { country_name: entry.country_name },
      });
    } catch (e: any) {
      if (e.code === "P2002") continue;       console.error(`Failed to insert country: ${entry.country_name}`, e);
    }
  }

    const india = await prisma.country.findFirst({
    where: { country_name: "India" },
  });

  if (!india) throw new Error("India not found in database");

    const stateRes = await axios.get(
    "https:  );
  const allStates = stateRes.data;
  const indianStates = allStates.filter(
    (state: any) => state.country_code === INDIA_ISO2,
  );

  for (const state of indianStates) {
    try {
      const newState = await prisma.state.create({
        data: {
          state_name: state.name,
          country_id: india.id,
        },
      });

            const cityRes = await axios.get(
        "https:      );
      const allCities = cityRes.data;
      const matchingCities = allCities.filter(
        (city: any) =>
          city.country_code === INDIA_ISO2 &&
          city.state_code === state.state_code,
      );

      if (matchingCities.length > 0) {
        await prisma.city.createMany({
          data: matchingCities.map((city: any) => ({
            city_name: city.name,
            state_id: newState.id,
          })),
          skipDuplicates: true,
        });

        console.log(
          `✅ Added ${matchingCities.length} cities for ${state.name}`,
        );
      }
    } catch (err) {
      console.error(`❌ Error processing state ${state.name}`, err);
    }
  }

  console.log("🎉 All data seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Error in seeding process", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
