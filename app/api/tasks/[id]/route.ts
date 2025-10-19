import { auth } from "@/lib/auth/auth";
import { failure, success } from "@/lib/api/http";
import { deleteTask, getTaskById, updateTask } from "@/lib/db/task/crud";
import { TaskStatus, TaskUpdateInput } from "@/lib/db/task/type";

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
  { params }: any
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

    const assignedToId: string | null | undefined = payload.assignedToId;

    // Handle studentIds - can be single studentId or array of studentIds
    let studentIds: string[] | undefined = undefined;
    if (Array.isArray(payload.studentIds)) {
      studentIds = payload.studentIds.filter((id: any): id is string => typeof id === "string");
    } else if (typeof payload.studentId === "string") {
      studentIds = [payload.studentId];
    } else if (payload.studentId === null || payload.studentIds === null) {
      studentIds = [];
    }

    const patch: TaskUpdateInput = {
      title: typeof payload.title === "string" ? payload.title : undefined,
      description:
        payload.description === null || typeof payload.description === "string"
          ? payload.description
          : undefined,
      status,
      studentIds,
      assignedToId:
        assignedToId === null || typeof assignedToId === "string"
          ? assignedToId
          : undefined,
      dueDate: payload.dueDate ?? undefined,
    };

    const updated = await updateTask(taskId, patch, userId);
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
  { params }: any
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
