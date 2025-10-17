import { auth } from "@/lib/auth/auth";
import { failure, success } from "@/lib/api/http";
import { createTask, getTasks } from "@/lib/db/task/crud";
import { TaskCreateInput, TaskFilter, TaskStatus } from "@/lib/db/task/type";
import { getUserByEmail } from "@/lib/db/auth/user";

const ALLOWED_STATUS: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

function coerceStatus(value: unknown): TaskStatus | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return ALLOWED_STATUS.includes(upper as TaskStatus)
    ? (upper as TaskStatus)
    : undefined;
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return failure("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "assigned";
  const studentId = searchParams.get("studentId") ?? undefined;
  const excludeSelfCreated = searchParams.get("excludeSelfCreated") === "true";
  const rawStatuses = searchParams.getAll("status");

  const statuses = rawStatuses
    .map(coerceStatus)
    .filter((status): status is TaskStatus => Boolean(status));

  const filter: TaskFilter = {
    status: statuses.length ? statuses : undefined,
  };

  if (view === "created") {
    filter.createdById = userId;
    if (studentId) {
      filter.studentId = studentId;
    }
  } else if (view === "student") {
    // New view: fetch all tasks for a specific student
    if (!studentId) {
      return failure("studentId is required for student view", 400);
    }
    filter.studentId = studentId;
    if (excludeSelfCreated) {
      filter.excludeCreatorId = userId;
    }
  } else if (view === "assigned") {
    filter.assignedToId = userId;
    if (excludeSelfCreated) {
      filter.excludeCreatorId = userId;
    }
    if (studentId) {
      filter.studentId = studentId;
    }
  } else {
    filter.assignedToId = userId;
  }

  try {
    const tasks = await getTasks(filter);
    return success(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return failure("Failed to fetch tasks", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return failure("Unauthorized", 401);
  }

  try {
    const payload = await request.json();
    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    if (!title) {
      return failure("Title is required", 400, { code: "VALIDATION_ERROR" });
    }

    let assignedToId: string | null | undefined = payload.assignedToId ?? null;

    if (!assignedToId && typeof payload.assignedToEmail === "string") {
      const assignee = await getUserByEmail(payload.assignedToEmail.trim());
      if (!assignee) {
        return failure("Assigned user not found", 400, {
          code: "INVALID_ASSIGNEE",
        });
      }
      assignedToId = assignee.id;
    }

    const status = coerceStatus(payload.status);

    const data: TaskCreateInput = {
      title,
      description: typeof payload.description === "string" ? payload.description : null,
      status,
      dueDate: payload.dueDate ?? null,
      studentId: typeof payload.studentId === "string" ? payload.studentId : null,
      assignedToId: assignedToId ?? null,
    };

    const task = await createTask({ ...data, createdById: userId });
    return success(task, 201);
  } catch (error) {
    console.error("Error creating task:", error);
    return failure("Failed to create task", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
