import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "../../../../_auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  await prisma.userPermission.deleteMany({ where: { user_id: id } });
  return success({ reset: true });
}
