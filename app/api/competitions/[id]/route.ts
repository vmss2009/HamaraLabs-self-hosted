import { NextResponse } from "next/server";
import {
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
} from "@/lib/db/competition/crud";
import { competitionSchema } from "@/lib/db/competition/type";

export async function GET(request: Request, { params }: any) {
  try {
    const id = params.id as string;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid competition ID" },
        { status: 400 }
      );
    }

    const competition = await getCompetitionById(id);

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(competition);
  } catch (error) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const id = params.id as string;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid competition ID" },
        { status: 400 }
      );
    }

    const competition = await getCompetitionById(id);
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    await deleteCompetition(id);

    return NextResponse.json({ message: "Competition deleted successfully" });
  } catch (error) {
    console.error("Error deleting competition:", error);
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const id = params.id as string;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid competition ID" },
        { status: 400 }
      );
    }

    const competition = await getCompetitionById(id);
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      organised_by: organisedBy,
      application_start_date: applicationStartDate,
      application_end_date: applicationEndDate,
      competition_start_date: competitionStartDate,
      competition_end_date: competitionEndDate,
      eligibility,
      reference_links: referenceLinks,
      requirements,
      payment,
      fee,
    } = body;

    const competitionData = {
      name,
      description,
      organised_by: organisedBy,
      application_start_date: new Date(applicationStartDate),
      application_end_date: new Date(applicationEndDate),
      competition_start_date: new Date(competitionStartDate),
      competition_end_date: new Date(competitionEndDate),
      eligibility: Array.isArray(eligibility) ? eligibility : [],
      reference_links: Array.isArray(referenceLinks) ? referenceLinks : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      payment,
      fee: payment === "paid" ? fee : null,
    };

    const result = competitionSchema.safeParse(competitionData);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const updatedCompetition = await updateCompetition(id, result.data);

    return NextResponse.json(updatedCompetition);
  } catch (error) {
    console.error("Error updating competition:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update competition",
      },
      { status: 400 }
    );
  }
}
