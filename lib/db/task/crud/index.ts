import { prisma } from "@/lib/db/prisma";
import {
  TaskCreateInput,
  TaskFilter,
  TaskUpdateInput,
  TaskWithRelations,
  TaskStatus,
} from "../type";

function taskDelegate() {
  return (prisma as any).task as {
    create: (args: any) => Promise<TaskWithRelations>;
    findMany: (args: any) => Promise<TaskWithRelations[]>;
    findUnique: (args: any) => Promise<TaskWithRelations | null>;
    update: (args: any) => Promise<TaskWithRelations>;
    delete: (args: any) => Promise<void>;
  };
}

function parseDueDate(value: TaskCreateInput["dueDate"]): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function buildInclude() {
  return {
    students: {
      select: {
        id: true,
        studentId: true,
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            school_id: true,
          },
        },
      },
    },
    createdBy: {
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    },
    assignedTo: {
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    },
  } as const;
}

export async function createTask(
  data: TaskCreateInput & { createdById: string }
): Promise<TaskWithRelations> {
  const dueDate = parseDueDate(data.dueDate);
  const studentIds = data.studentIds || [];

  return taskDelegate().create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? ("PENDING" as TaskStatus),
      dueDate,
      assignedToId: data.assignedToId ?? null,
      createdById: data.createdById,
      students: {
        create: studentIds.map((studentId) => ({
          studentId,
        })),
      },
    },
    include: buildInclude(),
  });
}

export async function getTasks(filter: TaskFilter = {}): Promise<TaskWithRelations[]> {
  const where: Record<string, unknown> = {};

  if (filter.studentId) {
    where.students = {
      some: {
        studentId: filter.studentId,
      },
    };
  }
  if (filter.assignedToId) where.assignedToId = filter.assignedToId;
  if (filter.createdById) where.createdById = filter.createdById;
  if (filter.status && filter.status.length > 0) {
    where.status = { in: filter.status };
  }
  if (filter.excludeCreatorId) {
    where.NOT = { createdById: filter.excludeCreatorId };
  }

  return taskDelegate().findMany({
    where,
    include: buildInclude(),
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  return taskDelegate().findUnique({
    where: { id },
    include: buildInclude(),
  });
}

export async function updateTask(
  id: string,
  data: TaskUpdateInput
): Promise<TaskWithRelations> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.status !== undefined) patch.status = data.status;
  if (data.assignedToId !== undefined) patch.assignedToId = data.assignedToId;
  if (data.dueDate !== undefined) patch.dueDate = parseDueDate(data.dueDate);

  // Handle student updates
  if (data.studentIds !== undefined) {
    const currentTask = await getTaskById(id);
    const currentStudentIds = currentTask?.students?.map((s) => s.studentId) || [];
    const newStudentIds = data.studentIds || [];

    // Find students to add and remove
    const toAdd = newStudentIds.filter((sid) => !currentStudentIds.includes(sid));
    const toRemove = currentStudentIds.filter((sid) => !newStudentIds.includes(sid));

    return taskDelegate().update({
      where: { id },
      data: {
        ...patch,
        students: {
          deleteMany: toRemove.length > 0 ? { studentId: { in: toRemove } } : undefined,
          create: toAdd.map((studentId) => ({ studentId })),
        },
      },
      include: buildInclude(),
    });
  }

  return taskDelegate().update({
    where: { id },
    data: patch,
    include: buildInclude(),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await taskDelegate().delete({
    where: { id },
  });
}
