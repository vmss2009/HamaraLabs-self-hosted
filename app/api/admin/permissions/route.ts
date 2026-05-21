import { failure, success } from "@/lib/api/http";
import { listPermissions, upsertPermission } from "@/lib/db/authz";
import { requireAdmin } from "../_auth";

export async function GET() {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const permissions = await listPermissions();
  return success(permissions);
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const body = await request.json();
  const { action, subject, field, conditions, inverted, reason, description } = body;

  if (!action || !subject) return failure("action and subject are required", 400);

  try {
    const permission = await upsertPermission({
      action,
      subject,
      field: field || null,
      conditions: conditions || null,
      inverted: inverted ?? false,
      reason: reason || null,
      description: description || null,
    });
    return success(permission, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create permission", 400);
  }
}
