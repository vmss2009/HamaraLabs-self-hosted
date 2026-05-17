import { failure, success } from "@/lib/api/http";
import {
  getCustomisedCompetitionById,
  updateCustomisedCompetition,
  deleteCustomisedCompetition,
  getCustomisedCompetitions,
} from "@/lib/db/customised-competition/crud";
import { CustomisedCompetitionCreateInput } from "@/lib/db/customised-competition/type";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (id === "list") {
      const { searchParams } = new URL(request.url);
      const student_id = searchParams.get("student_id");

      if (!student_id) {
        return failure("Student ID is required", 400, { code: "MISSING_PARAM" });
      }

      const customisedCompetitions = await getCustomisedCompetitions({
        student_id: student_id,
      });
      return success(customisedCompetitions);
    }

    const customisedCompetition = await getCustomisedCompetitionById(id);

    if (!customisedCompetition) {
      return failure("Customised competition not found", 404);
    }

    return success(customisedCompetition);
  } catch (error) {
    console.error("Error fetching customised competition:", error);
    return failure("Failed to fetch customised competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!data.competition_id || !data.student_id) {
      return failure("Missing required fields", 400, { code: "VALIDATION_ERROR" });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const customisedCompetition = await updateCustomisedCompetition(
      id,
      {
        ...(data as Partial<CustomisedCompetitionCreateInput>),
        keepSnapshotAttachmentUrls: Array.isArray((data as any)?.keepSnapshotAttachmentUrls)
          ? (data as any).keepSnapshotAttachmentUrls as string[]
          : [],
      },
      userId
    );

    return success(customisedCompetition);
  } catch (error) {
    console.error("Error updating customised competition:", error);
    return failure("Failed to update customised competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCustomisedCompetition(id);

    return success({
      message: "Customised competition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customised competition:", error);
    return failure("Failed to delete customised competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allow partial updates: status, comments, attachments
    const patchData: any = {};
    if (Array.isArray(body.status)) {
      patchData.status = body.status;
    }
    if (typeof body.comments === 'string') {
      patchData.comments = body.comments;
    }
    if (Array.isArray(body.attachments)) {
      patchData.attachments = body.attachments;
    }

    if (Object.keys(patchData).length === 0) {
      return failure("No valid fields to update", 400, { code: "VALIDATION_ERROR" });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const updatedCompetition = await updateCustomisedCompetition(id, {
      ...patchData,
      keepSnapshotAttachmentUrls: Array.isArray((body as any)?.keepSnapshotAttachmentUrls)
        ? (body as any).keepSnapshotAttachmentUrls as string[]
        : [],
    }, userId);

    return success(updatedCompetition);
  } catch (error) {
    console.error("Error updating customised competition:", error);
    return failure("Failed to update customised competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
