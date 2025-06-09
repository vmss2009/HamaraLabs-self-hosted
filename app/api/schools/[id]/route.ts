import { NextRequest, NextResponse } from "next/server";
import {
  getSchoolById,
  updateSchool,
  deleteSchool,
} from "@/lib/db/school/crud";
import {
  getAddressById,
  updateAddress,
  deleteAddress,
} from "@/lib/db/address/crud";
import { Prisma } from "@prisma/client";
import { schoolSchema } from "../route";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const id = parseInt(params.id);
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
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const school = await getSchoolById(id);

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const data = await request.json();

    const result = schoolSchema.partial().safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    if (validatedData.address) {
      const address = await getAddressById(school.address.id);
      if (!address) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }

      await updateAddress(school.address_id, validatedData.address);
    }

    const updatePayload = {
      name: validatedData.name ?? school.name,
      is_ATL: validatedData.is_ATL ?? school.is_ATL,
      address_id: school.address.id,
      in_charge:
        validatedData.in_charge !== undefined
          ? validatedData.in_charge
          : school.in_charge ?? Prisma.JsonNull,
      correspondent:
        validatedData.correspondent !== undefined
          ? validatedData.correspondent
          : school.correspondent ?? Prisma.JsonNull,
      principal:
        validatedData.principal !== undefined
          ? validatedData.principal
          : school.principal ?? Prisma.JsonNull,
      syllabus: validatedData.syllabus ?? school.syllabus,
      website_url: validatedData.website_url ?? school.website_url,
      paid_subscription:
        validatedData.paid_subscription ?? school.paid_subscription,
      social_links: validatedData.social_links ?? school.social_links ?? [],
    };

    const updatedSchool = await updateSchool(id, updatePayload);

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const id = parseInt(params.id);
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
