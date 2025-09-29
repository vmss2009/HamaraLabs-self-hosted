import { CustomisedCourseCreateInput, CustomisedCourseFilter, CustomisedCourseWithRelations } from "../type";
import { prisma } from "@/lib/db/prisma";
import { pruneCourseAttachments } from "@/lib/db/snapshot-attachments/crud";
import { notifyStudentAssignment, notifyStudentStatusUpdate } from "@/lib/notifications/service";

function haveStatusesChanged(previous: string[] | null | undefined, next: string[] | null | undefined) {
  if (!next) return false;
  const prev = previous ?? [];
  if (prev.length !== next.length) return true;
  const prevSet = new Set(prev);
  if (prevSet.size !== new Set(next).size) return true;
  for (const status of next) {
    if (!prevSet.has(status)) return true;
  }
  return false;
}

export async function createCustomisedCourse(
  data: CustomisedCourseCreateInput,
): Promise<CustomisedCourseWithRelations> {
  const created = await prisma.customisedCourse.create({
    data: {
      course_id: data.course_id,
      student_id: data.student_id,
      status: data.status,
      comments: (data as any).comments,
      attachments: (data as any).attachments,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organised_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });

  await notifyStudentAssignment({
    studentId: created.student.id,
    entityType: "course",
    entityName: created.course.name,
    resourceId: created.id,
  });

  return created;
}

export async function getCustomisedCourses(
  filter?: CustomisedCourseFilter,
): Promise<CustomisedCourseWithRelations[]> {
  return prisma.customisedCourse.findMany({
    where: {
      course_id: filter?.course_id,
      student_id: filter?.student_id,
      status: filter?.status ? { hasSome: filter.status } : undefined,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organised_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function getCustomisedCourseById(
  id: string,
): Promise<CustomisedCourseWithRelations | null> {
  return prisma.customisedCourse.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organised_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function updateCustomisedCourse(
  id: string,
  data: Partial<CustomisedCourseCreateInput> & { keepSnapshotAttachmentUrls?: string[] },
): Promise<CustomisedCourseWithRelations> {
  const keepUrls = data.keepSnapshotAttachmentUrls || [];
  const existing = await prisma.customisedCourse.findUnique({
    where: { id },
    select: { status: true },
  });
  const updated = await prisma.customisedCourse.update({
    where: { id },
    data: {
      course_id: data.course_id,
      student_id: data.student_id,
      status: data.status,
      comments: (data as any).comments,
      attachments: (data as any).attachments,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organised_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
  if (Object.prototype.hasOwnProperty.call(data, 'keepSnapshotAttachmentUrls')) {
    await pruneCourseAttachments(id, keepUrls);
  }
  if (haveStatusesChanged(existing?.status, Array.isArray(data.status) ? data.status : undefined)) {
    await notifyStudentStatusUpdate({
      studentId: updated.student.id,
      entityType: "course",
      entityName: updated.course.name,
      statusList: Array.isArray(updated.status) ? updated.status : [],
      resourceId: updated.id,
    });
  }
  return updated;
}

export async function deleteCustomisedCourse(
  id: string,
): Promise<CustomisedCourseWithRelations> {
  return prisma.customisedCourse.delete({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organised_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}
