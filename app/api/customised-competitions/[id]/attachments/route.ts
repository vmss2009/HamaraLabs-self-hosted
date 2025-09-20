import { failure, success } from "@/lib/api/http";
import { createCompetitionAttachments, SnapshotAttachmentInput } from "@/lib/db/snapshot-attachments/crud";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const attachments = Array.isArray(body?.attachments) ? (body.attachments as SnapshotAttachmentInput[]) : [];
    if (attachments.length === 0) {
      return failure("No attachments provided", 400, { code: "NO_ATTACHMENTS" });
    }

    const created = await createCompetitionAttachments(id, attachments);
    return success(created, 201);
  } catch (error) {
    console.error("Error creating competition attachments:", error);
    return failure("Failed to create attachments", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}