import { NextRequest, NextResponse } from "next/server";
import {
  getSchoolById,
  updateSchool,
  deleteSchool,
} from "@/lib/db/school/crud";
import { deleteAddress } from "@/lib/db/address/crud";
import { SchoolUpdateInput, schoolSchema } from "@/lib/db/school/type";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const id = params.id;
    const school = await getSchoolById(id);

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const id = params.id;

    const school = await getSchoolById(id);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const data = await request.json();

    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const parsed = result.data;

    const validatedData: SchoolUpdateInput = {
      name: parsed.name,
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
      correspondent: parsed.correspondent,
      principal: parsed.principal,
      in_charge: parsed.in_charge,
    };

    const updatedSchool = await updateSchool(id, validatedData);

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const id = params.id;
    const school = await getSchoolById(id);

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    await deleteSchool(id);

    await deleteAddress(school.address_id);

    return NextResponse.json({ message: "School deleted successfully" });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Failed to delete school" },
      { status: 500 }
    );
  }
}
