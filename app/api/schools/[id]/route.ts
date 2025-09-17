import { failure, success } from "@/lib/api/http";
import { NextRequest } from "next/server";
import {
  getSchoolById,
  updateSchool,
  deleteSchool,
} from "@/lib/db/school/crud";
import { deleteAddress } from "@/lib/db/address/crud";
import { SchoolUpdateInput, schoolSchema } from "@/lib/db/school/type";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const school = await getSchoolById(id);

    if (!school) {
      return failure("School not found", 404);
    }

    return success(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return failure("Failed to fetch school", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const school = await getSchoolById(id);
    if (!school) {
      return failure("School not found", 404);
    }

    const data = await request.json();

    console.log('Received data for validation:', JSON.stringify(data, null, 2));
    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      console.error("Detailed errors:", result.error.errors);
      console.error("Full error structure:", JSON.stringify(result.error.flatten(), null, 2));
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const parsed = result.data;

    const validatedData: SchoolUpdateInput = {
      name: parsed.name,
      udise_code: parsed.udise_code,
      is_ATL: parsed.is_ATL,
      ATL_establishment_year: parsed.is_ATL
        ? parsed.ATL_establishment_year ?? null
        : null,
      syllabus: parsed.syllabus,
      website_url: parsed.website_url,
      paid_subscription: parsed.paid_subscription,
      social_links: parsed.social_links,
      address: {
        address_line1: parsed.address.address_line1,
        address_line2: parsed.address.address_line2,
        pincode: parsed.address.pincode,
        city_id: parsed.address.cityId,
      },
      correspondents: parsed.correspondents,
      principals: parsed.principals,
      in_charges: parsed.in_charges,
    };

    const updatedSchool = await updateSchool(id, validatedData);

    return success(updatedSchool);
  } catch (error) {
    console.error("Unexpected error:", error);
    return failure("Internal server error", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const school = await getSchoolById(id);

    if (!school) {
      return failure("School not found", 404);
    }

    await deleteSchool(id);

    await deleteAddress(school.address_id);

    return success({ message: "School deleted successfully" });
  } catch (error) {
    console.error("Error deleting school:", error);
    return failure("Failed to delete school", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
