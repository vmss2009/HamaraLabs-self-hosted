import { prisma } from "@/lib/db/prisma";
import { createNotifications } from "@/lib/db/notification/crud";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeTextHtml(text: string) {
  const value = `${text ?? ""}`.trim();
  if (!value) return "";
  return `<span>${escapeHtml(value)}</span>`;
}

function normalizeHtmlContent(html?: string | null) {
  const value = `${html ?? ""}`;
  if (!value.trim()) return "";
  return value;
}

async function fetchStudentStakeholders(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      school: {
        select: {
          id: true,
          name: true,
          incharges: { select: { id: true } },
        },
      },
    },
  });

  if (!student) {
    return { student: null, stakeholders: [] as { userId: string }[] };
  }

  const mentors = student.school?.id
    ? await prisma.mentor.findMany({
        where: {
          school_ids: { has: student.school.id },
          user_id: { not: null },
        },
        select: { user_id: true },
      })
    : [];

  const stakeholderMap = new Map<string, { userId: string }>();
  for (const u of student.school?.incharges ?? []) {
    if (u.id) stakeholderMap.set(u.id, { userId: u.id });
  }
  for (const m of mentors) {
    if (m.user_id) stakeholderMap.set(m.user_id, { userId: m.user_id });
  }

  const fullName = [student.first_name, student.last_name].filter(Boolean).join(" ") || "Student";

  return {
    student: {
      id: student.id,
      fullName,
      schoolName: student.school?.name ?? "",
    },
    stakeholders: Array.from(stakeholderMap.values()),
  };
}

export async function notifyChatMessage(roomId: string, senderId: string, content?: string | null, attachmentCount = 0) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: {
      name: true,
      members: { select: { id: true } },
    },
  });
  if (!room) return;
  const recipients = room.members.filter((m) => m.id !== senderId).map((m) => m.id);
  if (!recipients.length) return;

  let description = content ? normalizeHtmlContent(content) : undefined;
  if (!description && attachmentCount) {
    const attachmentText = attachmentCount === 1 ? "Sent an attachment" : `Sent ${attachmentCount} attachments`;
    description = makeTextHtml(attachmentText);
  }

  await createNotifications(
    recipients.map((userId) => ({
      userId,
      title: `New message in ${room.name}`,
      description,
      category: "chat",
      resourceType: "chatRoom",
      resourceId: roomId,
    })),
  );
}

export async function notifyStudentStatusUpdate(params: {
  studentId: string;
  entityType: "course" | "competition" | "tinkering-activity";
  entityName: string;
  previousStatus?: string | null;
  currentStatus?: string | null;
  resourceId: string;
}) {
  const { student, stakeholders } = await fetchStudentStakeholders(params.studentId);
  if (!student || !stakeholders.length) return;

  const previousStatus = params.previousStatus?.trim() || "previous status";
  const currentStatus = params.currentStatus?.trim() || "updated";
  const entityLabel =
    params.entityType === "course"
      ? "Course"
      : params.entityType === "competition"
        ? "Competition"
        : "Tinkering activity";
  const title = `${entityLabel} status changed`;
  const description = makeTextHtml(
    `${params.entityName} for ${student.fullName} changed from ${previousStatus} to ${currentStatus}`,
  );

  await createNotifications(
    stakeholders.map((s) => ({
      userId: s.userId,
      title,
      description,
      category: "status",
      resourceType: params.entityType,
      resourceId: params.resourceId,
      data: {
        studentId: student.id,
        studentName: student.fullName,
        schoolName: student.schoolName,
        statusPrevious: params.previousStatus ?? null,
        statusCurrent: params.currentStatus ?? null,
        entityName: params.entityName,
      },
    })),
  );
}

export async function notifyStudentAssignment(params: {
  studentId: string;
  entityType: "course" | "competition" | "tinkering-activity";
  entityName: string;
  resourceId: string;
}) {
  const { student, stakeholders } = await fetchStudentStakeholders(params.studentId);
  if (!student || !stakeholders.length) return;

  const entityLabel =
    params.entityType === "course"
      ? "Course"
      : params.entityType === "competition"
        ? "Competition"
        : "Tinkering activity";
  const title = `${entityLabel} assigned`;
  const description = makeTextHtml(`${params.entityName} has been assigned to ${student.fullName}`);

  await createNotifications(
    stakeholders.map((s) => ({
      userId: s.userId,
      title,
      description,
      category: "assignment",
      resourceType: params.entityType,
      resourceId: params.resourceId,
      data: {
        studentId: student.id,
        studentName: student.fullName,
        schoolName: student.schoolName,
        entityName: params.entityName,
      },
    })),
  );
}

export async function notifyTaskAssignment(params: {
  studentId: string;
  taskTitle: string;
  taskId: string;
  assignedToId?: string | null;
}) {
  const { student, stakeholders } = await fetchStudentStakeholders(params.studentId);
  if (!student) return;

  const title = "Task assigned";
  const description = makeTextHtml(`${params.taskTitle} has been assigned to ${student.fullName}`);

  // Notify stakeholders (school incharges and mentors)
  if (stakeholders.length > 0) {
    await createNotifications(
      stakeholders.map((s) => ({
        userId: s.userId,
        title,
        description,
        category: "assignment",
        resourceType: "task",
        resourceId: params.taskId,
        data: {
          studentId: student.id,
          studentName: student.fullName,
          schoolName: student.schoolName,
          taskTitle: params.taskTitle,
        },
      })),
    );
  }

  // Also notify the assigned user if they're not already in stakeholders
  if (params.assignedToId) {
    const isAlreadyNotified = stakeholders.some((s) => s.userId === params.assignedToId);
    if (!isAlreadyNotified) {
      await createNotifications([
        {
          userId: params.assignedToId,
          title,
          description,
          category: "assignment",
          resourceType: "task",
          resourceId: params.taskId,
          data: {
            studentId: student.id,
            studentName: student.fullName,
            schoolName: student.schoolName,
            taskTitle: params.taskTitle,
          },
        },
      ]);
    }
  }
}
