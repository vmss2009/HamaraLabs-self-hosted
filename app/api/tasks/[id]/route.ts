import { auth } from "@/lib/auth/auth";
import { failure, success } from "@/lib/api/http";
import { deleteTask, getTaskById, updateTask } from "@/lib/db/task/crud";
import { TaskStatus, TaskUpdateInput } from "@/lib/db/task/type";
import { getUserByEmail } from "@/lib/db/auth/user";

const ALLOWED_STATUS: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

function coerceStatus(value: unknown): TaskStatus | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return ALLOWED_STATUS.includes(upper as TaskStatus)
    ? (upper as TaskStatus)
    : undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return failure("Unauthorized", 401);
  }

  const taskId = params.id;

  try {
    const existing = await getTaskById(taskId);
    if (!existing) {
      return failure("Task not found", 404);
    }

    const canModify =
      existing.createdBy.id === userId || existing.assignedTo?.id === userId;

    if (!canModify) {
      return failure("Forbidden", 403);
    }

    const payload = await request.json();
    const status = coerceStatus(payload.status);

    let assignedToId: string | null | undefined = payload.assignedToId;
    if (!assignedToId && typeof payload.assignedToEmail === "string") {
      const assignee = await getUserByEmail(payload.assignedToEmail.trim());
      if (!assignee) {
        return failure("Assigned user not found", 400, {
          code: "INVALID_ASSIGNEE",
        });
      }
      assignedToId = assignee.id;
    }

    const patch: TaskUpdateInput = {
      title: typeof payload.title === "string" ? payload.title : undefined,
      description:
        payload.description === null || typeof payload.description === "string"
          ? payload.description
          : undefined,
      status,
      studentId:
        payload.studentId === null || typeof payload.studentId === "string"
          ? payload.studentId
          : undefined,
      assignedToId:
        assignedToId === null || typeof assignedToId === "string"
          ? assignedToId
          : undefined,
      dueDate: payload.dueDate ?? undefined,
    };

    const updated = await updateTask(taskId, patch);
    return success(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return failure("Failed to update task", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return failure("Unauthorized", 401);
  }

  const taskId = params.id;

  try {
    const existing = await getTaskById(taskId);
    if (!existing) {
      return failure("Task not found", 404);
    }

    if (existing.createdBy.id !== userId) {
      return failure("Only the creator can delete a task", 403);
    }

    await deleteTask(taskId);
    return success({ ok: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return failure("Failed to delete task", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
