import { failure, success } from "@/lib/api/http";
import { createSchool, getSchools } from "@/lib/db/school/crud";
import { createAddress } from "@/lib/db/address/crud";
import { schoolSchema } from "@/lib/db/school/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      cityId: searchParams.get("cityId")
        ? parseInt(searchParams.get("cityId")!)
        : undefined,
      stateId: searchParams.get("stateId")
        ? parseInt(searchParams.get("stateId")!)
        : undefined,
      countryId: searchParams.get("countryId")
        ? parseInt(searchParams.get("countryId")!)
        : undefined,
    };

    const schools = await getSchools(filter);
    return success(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return failure("Failed to fetch schools", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;
    const address = await createAddress({
      address_line1: validatedData.address.address_line1,
      address_line2: validatedData.address.address_line2,
      pincode: validatedData.address.pincode,
      cityId: validatedData.address.cityId,
    });

    const school = await createSchool({
      name: validatedData.name,
      udise_code: validatedData.udise_code,
      is_ATL: validatedData.is_ATL,
      ATL_establishment_year: validatedData.ATL_establishment_year,
      address_id: address.id,
      in_charges: validatedData.in_charges,
      correspondents: validatedData.correspondents,
      principals: validatedData.principals,
      syllabus: validatedData.syllabus,
      website_url: validatedData.website_url,
      paid_subscription: validatedData.paid_subscription,
      social_links: validatedData.social_links,
    });

    return success(school, 201);
  } catch (error) {
    console.error("Error creating school:", error);
    if (error instanceof Error) {
      return failure(error.message, 400);
    }
    return failure("Failed to create school", 500);
  }
}
