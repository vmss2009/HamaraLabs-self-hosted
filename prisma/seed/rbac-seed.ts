import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODEL_SUBJECTS = [
  "User",
  "Role",
  "Permission",
  "School",
  "Student",
  "Mentor",
  "Task",
  "Course",
  "Competition",
  "CustomisedCourse",
  "CustomisedCompetition",
  "CustomisedTinkeringActivity",
  "TinkeringActivity",
  "SchoolVisit",
  "Hub",
  "Cluster",
  "Notification",
  "Booking",
  "Schedule",
  "Message",
  "ChatRoom",
] as const;

const CRUD_ACTIONS = ["view", "create", "update", "delete"] as const;

const UI_ELEMENTS: Record<string, string[]> = {
  Drawer: [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.sarthi",
    "nav.cluster.form",
    "nav.cluster.report",
    "nav.school-visits.form",
    "nav.student.form",
    "nav.student.report",
    "nav.school.form",
    "nav.school.report",
    "nav.mentor.form",
    "nav.mentor.report",
    "nav.tinkering-activity.form",
    "nav.tinkering-activity.report",
    "nav.competition.form",
    "nav.competition.report",
    "nav.course.form",
    "nav.course.report",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "nav.admin.users",
    "nav.admin.roles",
    "action.logout",
  ],

  SchoolForm: [
    "submit",
    "cancel",
    "section.basic",
    "section.address",
    "section.in-charges",
    "section.principals",
    "section.correspondents",
    "section.additional",
    "field.name",
    "field.udise_code",
    "field.is_ATL",
    "field.ATL_establishment_year",
    "field.address_line1",
    "field.address_line2",
    "field.country",
    "field.state",
    "field.city",
    "field.pincode",
    "field.in_charges",
    "field.in_charges.add",
    "field.in_charges.remove",
    "field.principals",
    "field.principals.add",
    "field.principals.remove",
    "field.correspondents",
    "field.correspondents.add",
    "field.correspondents.remove",
    "field.syllabus",
    "field.website_url",
    "field.paid_subscription",
    "field.social_links",
    "field.social_links.add",
    "field.social_links.remove",
  ],
  SchoolReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.name",
    "column.udise_code",
    "column.is_ATL",
    "column.ATL_establishment_year",
    "column.paid_subscription",
    "column.website_url",
    "column.social_links",
    "column.syllabus",
    "column.addressLine1",
    "column.addressLine2",
    "column.city",
    "column.state",
    "column.country",
    "column.pincode",
    "column.principals",
    "column.correspondents",
    "column.inCharges",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "filter.syllabus",
    "filter.atl",
    "filter.paid",
    "bulk.delete",
    "export.csv",
    "export.pdf",
    "detail.drawer",
  ],

  StudentForm: [
    "submit",
    "cancel",
    "section.school",
    "section.basic",
    "section.guardians",
    "field.school_id",
    "field.first_name",
    "field.last_name",
    "field.email",
    "field.class",
    "field.section",
    "field.aspiration",
    "field.comments",
    "field.gender",
    "field.guardians",
    "field.guardians.add",
    "field.guardians.remove",
  ],
  StudentReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.first_name",
    "column.last_name",
    "column.email",
    "column.gender",
    "column.calendar_link",
    "column.school",
    "column.class",
    "column.section",
    "column.aspiration",
    "column.comments",
    "column.guardians",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.view-snapshot",
    "row.open-calendar",
    "filter.school",
    "filter.class",
    "filter.gender",
    "bulk.delete",
    "bulk.assign-task",
    "export.csv",
    "export.pdf",
    "detail.drawer",
  ],

  MentorForm: [
    "submit",
    "cancel",
    "section.personal",
    "section.schools",
    "field.first_name",
    "field.last_name",
    "field.email",
    "field.phone_number",
    "field.school_ids",
    "field.comments",
  ],
  MentorReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.name",
    "column.email",
    "column.school_ids",
    "column.phone_number",
    "column.calendar_link",
    "column.comments",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.open-calendar",
    "filter.school",
    "bulk.delete",
    "export.csv",
    "detail.drawer",
  ],

  TaskForm: [
    "submit",
    "cancel",
    "field.title",
    "field.description",
    "field.school_id",
    "field.student_ids",
    "field.assigned_to",
    "field.due_date",
    "field.status",
  ],
  TaskReport: [
    "table",
    "tab.assigned",
    "tab.created",
    "action.create-task",
    "tool.quick-filter",
    "tool.column-visibility",
    "column.title",
    "column.students",
    "column.school",
    "column.created_by",
    "column.assigned_to",
    "column.status",
    "column.due_date",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.mark-complete",
    "row.reopen",
    "row.approve",
    "row.reject",
    "filter.status",
    "filter.assignee",
    "filter.school",
    "bulk.delete",
    "bulk.mark-complete",
    "export.csv",
    "detail.drawer",
    "modal.create",
    "modal.edit",
  ],

  SchoolVisitForm: [
    "submit",
    "cancel",
    "field.school_id",
    "field.visit_date",
    "field.point_of_contact",
    "field.other_poc_name",
    "field.no_of_ucs_submitted",
    "field.school_performance",
    "field.details",
    "field.details.add",
    "field.details.remove",
  ],
  SchoolVisitReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.school",
    "column.visit_date",
    "column.point_of_contact",
    "column.school_performance",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "filter.school",
    "filter.date-range",
    "filter.poc",
    "export.csv",
    "detail.drawer",
  ],

  ClusterForm: [
    "submit",
    "cancel",
    "field.cluster_name",
    "field.hub",
    "field.hub.add",
    "field.hub.remove",
    "field.hub_school",
    "field.spoke_schools",
  ],
  ClusterReport: [
    "list",
    "card",
    "card.view",
    "card.edit",
    "card.delete",
    "action.create-cluster",
  ],

  TinkeringActivityForm: [
    "submit",
    "cancel",
    "section.basic",
    "section.classification",
    "section.content",
    "field.name",
    "field.introduction",
    "field.subject",
    "field.topic",
    "field.subtopic",
    "field.goals",
    "field.goals.add",
    "field.goals.remove",
    "field.materials",
    "field.materials.add",
    "field.materials.remove",
    "field.instructions",
    "field.instructions.add",
    "field.instructions.remove",
    "field.tips",
    "field.tips.add",
    "field.tips.remove",
    "field.observations",
    "field.observations.add",
    "field.observations.remove",
    "field.extensions",
    "field.extensions.add",
    "field.extensions.remove",
    "field.resources",
    "field.resources.add",
    "field.resources.remove",
  ],
  TinkeringActivityReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.name",
    "column.introduction",
    "column.subject_name",
    "column.topic_name",
    "column.subtopic_name",
    "column.goals",
    "column.materials",
    "column.instructions",
    "column.tips",
    "column.observations",
    "column.extensions",
    "column.resources",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.assign",
    "filter.subject",
    "filter.topic",
    "filter.subtopic",
    "bulk.delete",
    "export.csv",
    "detail.drawer",
  ],

  CompetitionForm: [
    "submit",
    "cancel",
    "section.basic",
    "section.dates",
    "section.payment",
    "section.criteria",
    "field.name",
    "field.description",
    "field.organised_by",
    "field.application_start_date",
    "field.application_end_date",
    "field.competition_start_date",
    "field.competition_end_date",
    "field.payment",
    "field.fee",
    "field.eligibility",
    "field.eligibility.add",
    "field.eligibility.remove",
    "field.reference_links",
    "field.reference_links.add",
    "field.reference_links.remove",
    "field.requirements",
    "field.requirements.add",
    "field.requirements.remove",
  ],
  CompetitionReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.name",
    "column.description",
    "column.organised_by",
    "column.application_start_date",
    "column.application_end_date",
    "column.competition_start_date",
    "column.competition_end_date",
    "column.payment",
    "column.fee",
    "column.eligibility",
    "column.reference_links",
    "column.requirements",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.assign",
    "filter.organised-by",
    "filter.payment",
    "filter.date-range",
    "bulk.delete",
    "export.csv",
    "detail.drawer",
  ],

  CourseForm: [
    "submit",
    "cancel",
    "section.basic",
    "section.dates",
    "section.eligibility",
    "section.metadata",
    "field.name",
    "field.description",
    "field.organised_by",
    "field.application_start_date",
    "field.application_end_date",
    "field.course_start_date",
    "field.course_end_date",
    "field.eligibility_from",
    "field.eligibility_to",
    "field.reference_link",
    "field.requirements",
    "field.requirements.add",
    "field.requirements.remove",
    "field.course_tags",
    "field.course_tags.add",
    "field.course_tags.remove",
  ],
  CourseReport: [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "tool.export",
    "column.name",
    "column.description",
    "column.organised_by",
    "column.application_start_date",
    "column.application_end_date",
    "column.course_start_date",
    "column.course_end_date",
    "column.eligibility_from",
    "column.eligibility_to",
    "column.requirements",
    "column.course_tags",
    "column.reference_link",
    "row.click-detail",
    "row.edit",
    "row.delete",
    "row.assign",
    "filter.organised-by",
    "filter.tags",
    "filter.date-range",
    "bulk.delete",
    "export.csv",
    "detail.drawer",
  ],

  Snapshot: [
    "selector.view-mode",
    "selector.cluster",
    "selector.hub",
    "selector.school",
    "selector.student",
    "tab.tinkering",
    "tab.competition",
    "tab.courses",
    "tab.tasks",
    "action.add-tinkering",
    "action.add-competition",
    "action.add-course",
    "action.add-task",
    "action.update-status",
    "action.attach-file",
    "action.detach-file",
    "row.edit",
    "row.delete",
    "row.view",
    "modal.edit-tinkering",
    "modal.edit-competition",
    "modal.edit-course",
    "modal.status",
    "field.status",
    "field.comments",
    "field.attachments",
    "export.csv",
  ],

  Sarthi: [
    "tab.visits",
    "tab.compliance",
    "tab.hackathons",
    "widget.upcoming-visits",
    "widget.recent-tasks",
    "widget.student-progress",
    "widget.school-stats",
  ],

  Dashboard: [
    "widget.upcoming-visits",
    "widget.recent-tasks",
    "widget.student-progress",
    "widget.school-stats",
    "widget.notifications",
    "widget.chats",
  ],

  Chats: [
    "list.rooms",
    "list.room-item",
    "action.create-room",
    "action.search-rooms",
    "modal.create-room",
    "modal.create-room.field.name",
    "modal.create-room.field.members",
    "modal.create-room.submit",
  ],
  ChatRoom: [
    "messages.list",
    "messages.message",
    "messages.search",
    "input.text",
    "input.attach",
    "input.send",
    "input.emoji",
    "editor.toolbar.bold",
    "editor.toolbar.italic",
    "editor.toolbar.highlight",
    "editor.toolbar.table",
    "editor.toolbar.math",
    "editor.toolbar.align",
    "editor.resize",
    "action.reply",
    "action.cancel-reply",
    "action.delete-message",
    "action.edit-message",
    "action.copy-message",
    "media.zoom-in",
    "media.zoom-out",
    "media.reset-zoom",
    "media.download",
    "media.close",
    "header.room-name",
    "header.members-button",
    "modal.manage-members",
    "modal.manage-members.add",
    "modal.manage-members.remove",
    "modal.manage-members.promote",
    "modal.manage-members.demote",
  ],

  Calendar: [
    "view.day",
    "view.week",
    "view.month",
    "date-picker",
    "schedule.create",
    "schedule.delete",
    "timeslot.add",
    "timeslot.edit",
    "timeslot.delete",
    "timeslot.field.start_time",
    "timeslot.field.end_time",
    "timeslot.field.max_slots",
    "action.save",
    "action.cancel",
    "action.replicate",
    "modal.replication",
    "modal.replication.select-dates",
    "modal.replication.submit",
    "booking.list",
    "booking.detail",
    "booking.cancel",
    "booking.confirm",
  ],

  Notifications: [
    "list",
    "list.item",
    "list.item.mark-read",
    "list.item.mark-unread",
    "list.item.delete",
    "filter.category",
    "filter.read-status",
    "action.mark-all-read",
    "action.clear-all",
  ],

  AdminUsers: [
    "table",
    "action.create-user",
    "row.edit",
    "row.delete",
    "row.assign-role",
    "row.remove-role",
    "row.set-priority",
    "row.toggle-admin",
    "filter.role",
    "filter.school",
    "export.csv",
  ],

  AdminRoles: [
    "table",
    "action.create-role",
    "row.edit",
    "row.delete",
    "row.manage-permissions",
    "modal.permissions.add",
    "modal.permissions.remove",
  ],

  AdminPermissions: [
    "table",
    "action.create-permission",
    "row.edit",
    "row.delete",
    "filter.subject",
    "filter.action",
  ],
};

async function upsertPermission(
  action: string,
  subject: string,
  field: string | null,
  description?: string,
  conditions?: Prisma.InputJsonValue,
) {
  const fieldKey = field ?? "";
  return prisma.permission.upsert({
    where: { action_subject_field: { action, subject, field: fieldKey } },
    create: {
      action,
      subject,
      field: fieldKey,
      description,
      conditions,
    },
    update: { description, conditions },
  });
}

async function ensureRole(name: string, description: string, isSystem = false) {
  return prisma.role.upsert({
    where: { name },
    create: { name, description, is_system: isSystem },
    update: { description },
  });
}

async function grant(roleId: string, permId: string) {
  return prisma.rolePermission.upsert({
    where: {
      role_id_permission_id: { role_id: roleId, permission_id: permId },
    },
    create: { role_id: roleId, permission_id: permId },
    update: {},
  });
}

async function main() {
  const allPerms: { id: string; action: string; subject: string; field: string }[] = [];

  for (const subject of MODEL_SUBJECTS) {
    const p = await upsertPermission("manage", subject, null, `Full control over ${subject}`);
    allPerms.push({ id: p.id, action: p.action, subject: p.subject, field: p.field });
  }

  for (const subject of MODEL_SUBJECTS) {
    for (const action of CRUD_ACTIONS) {
      const p = await upsertPermission(action, subject, null, `${action} ${subject}`);
      allPerms.push({ id: p.id, action: p.action, subject: p.subject, field: p.field });
    }
  }

  for (const [subject, action] of [
    ["Student", "export"],
    ["Student", "import"],
    ["Student", "bulk-delete"],
    ["School", "export"],
    ["Task", "approve"],
    ["Task", "reject"],
  ] as const) {
    const p = await upsertPermission(action, subject, null, `${action} ${subject}`);
    allPerms.push({ id: p.id, action: p.action, subject: p.subject, field: p.field });
  }

  for (const [subject, keys] of Object.entries(UI_ELEMENTS)) {
    for (const key of keys) {
      const p = await upsertPermission("view", subject, key, `View ${subject}:${key}`);
      allPerms.push({ id: p.id, action: p.action, subject: p.subject, field: p.field });
    }
  }

  await prisma.role.deleteMany({ where: { name: "super_admin" } });

  const admin = await ensureRole("admin", "Full access to everything", true);
  const principal = await ensureRole("principal", "Read/manage own school + students", true);
  const incharge = await ensureRole("incharge", "Manage students in own school", true);
  const correspondent = await ensureRole("correspondent", "Read own school + students; financial/administrative liaison", true);
  const mentor = await ensureRole("mentor", "Read students and run sessions", true);
  const student = await ensureRole("student", "Self-service snapshot and tasks", true);

  const manageAll = await upsertPermission(
    "manage",
    "all",
    null,
    "Full access to every subject",
  );
  await grant(admin.id, manageAll.id);

  const scopedSchoolCondition: Prisma.InputJsonValue = {
    id: { $in: "${user.schools}" },
  };
  const scopedStudentCondition: Prisma.InputJsonValue = {
    school_id: { $in: "${user.schools}" },
  };

  const principalReadSchool = await upsertPermission(
    "view",
    "School",
    "principal-scope",
    "Principal: view own schools",
    scopedSchoolCondition,
  );
  const principalUpdateSchool = await upsertPermission(
    "update",
    "School",
    "principal-scope",
    "Principal: update own schools",
    scopedSchoolCondition,
  );
  const principalManageStudents = await upsertPermission(
    "manage",
    "Student",
    "principal-scope",
    "Principal: manage students in own schools",
    scopedStudentCondition,
  );

  async function grantUI(roleId: string, subject: string, keys: string[] | "*") {
    const allKeys = UI_ELEMENTS[subject] ?? [];
    const target = keys === "*" ? allKeys : keys;
    for (const k of target) {
      const p = allPerms.find(
        (pp) => pp.action === "view" && pp.subject === subject && pp.field === k,
      );
      if (p) await grant(roleId, p.id);
    }
  }

  async function grantModel(roleId: string, subject: string, actions: string[]) {
    for (const action of actions) {
      const p = allPerms.find(
        (pp) => pp.action === action && pp.subject === subject && pp.field === "",
      );
      if (p) await grant(roleId, p.id);
    }
  }

  await grant(principal.id, principalReadSchool.id);
  await grant(principal.id, principalUpdateSchool.id);
  await grant(principal.id, principalManageStudents.id);
  await grantModel(principal.id, "Task", ["view", "create", "update"]);
  await grantModel(principal.id, "SchoolVisit", ["view"]);
  await grantModel(principal.id, "Notification", ["view"]);
  await grantModel(principal.id, "Mentor", ["view"]);
  await grantModel(principal.id, "Booking", ["view"]);
  await grantModel(principal.id, "Schedule", ["view"]);
  await grantModel(principal.id, "ChatRoom", ["view", "create", "update"]);
  await grantModel(principal.id, "Message", ["view", "create"]);
  await grantUI(principal.id, "Drawer", [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.student.report",
    "nav.school.report",
    "nav.mentor.report",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "action.logout",
  ]);
  await grantUI(principal.id, "StudentReport", "*");
  await grantUI(principal.id, "SchoolReport", "*");
  await grantUI(principal.id, "MentorReport", ["table", "column.name", "column.email", "column.school_ids", "row.click-detail", "tool.quick-filter"]);
  await grantUI(principal.id, "TaskReport", "*");
  await grantUI(principal.id, "TaskForm", "*");
  await grantUI(principal.id, "Snapshot", "*");
  await grantUI(principal.id, "Notifications", "*");
  await grantUI(principal.id, "Calendar", "*");
  await grantUI(principal.id, "Chats", "*");
  await grantUI(principal.id, "ChatRoom", "*");
  await grantUI(principal.id, "Sarthi", ["tab.visits", "widget.upcoming-visits", "widget.recent-tasks"]);

  await grant(incharge.id, principalReadSchool.id);
  await grant(incharge.id, principalManageStudents.id);
  await grantModel(incharge.id, "Task", ["view", "create", "update"]);
  await grantModel(incharge.id, "SchoolVisit", ["view", "create"]);
  await grantModel(incharge.id, "Notification", ["view"]);
  await grantModel(incharge.id, "Mentor", ["view"]);
  await grantModel(incharge.id, "Booking", ["view"]);
  await grantModel(incharge.id, "Schedule", ["view"]);
  await grantModel(incharge.id, "ChatRoom", ["view", "create"]);
  await grantModel(incharge.id, "Message", ["view", "create"]);
  await grantUI(incharge.id, "Drawer", [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.school-visits.form",
    "nav.student.form",
    "nav.student.report",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "action.logout",
  ]);
  await grantUI(incharge.id, "StudentForm", "*");
  await grantUI(incharge.id, "StudentReport", "*");
  await grantUI(incharge.id, "SchoolVisitForm", "*");
  await grantUI(incharge.id, "TaskReport", "*");
  await grantUI(incharge.id, "TaskForm", "*");
  await grantUI(incharge.id, "Snapshot", "*");
  await grantUI(incharge.id, "Notifications", "*");
  await grantUI(incharge.id, "Calendar", "*");
  await grantUI(incharge.id, "Chats", "*");
  await grantUI(incharge.id, "ChatRoom", "*");

  await grant(correspondent.id, principalReadSchool.id);
  await grantModel(correspondent.id, "Student", ["view"]);
  await grantModel(correspondent.id, "SchoolVisit", ["view"]);
  await grantModel(correspondent.id, "Notification", ["view"]);
  await grantModel(correspondent.id, "Booking", ["view"]);
  await grantModel(correspondent.id, "Schedule", ["view"]);
  await grantModel(correspondent.id, "ChatRoom", ["view", "create"]);
  await grantModel(correspondent.id, "Message", ["view", "create"]);
  await grantUI(correspondent.id, "Drawer", [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.student.report",
    "nav.school.report",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "action.logout",
  ]);
  await grantUI(correspondent.id, "StudentReport", "*");
  await grantUI(correspondent.id, "SchoolReport", "*");
  await grantUI(correspondent.id, "Snapshot", "*");
  await grantUI(correspondent.id, "Notifications", "*");
  await grantUI(correspondent.id, "Calendar", "*");
  await grantUI(correspondent.id, "Chats", "*");
  await grantUI(correspondent.id, "ChatRoom", "*");

  await grantModel(mentor.id, "Student", ["view"]);
  await grantModel(mentor.id, "Task", ["view", "create", "update"]);
  await grantModel(mentor.id, "Notification", ["view"]);
  await grantModel(mentor.id, "Schedule", ["view", "create", "update"]);
  await grantModel(mentor.id, "Booking", ["view"]);
  await grantModel(mentor.id, "ChatRoom", ["view", "create"]);
  await grantModel(mentor.id, "Message", ["view", "create"]);
  await grantModel(mentor.id, "TinkeringActivity", ["view"]);
  await grantModel(mentor.id, "Competition", ["view"]);
  await grantModel(mentor.id, "Course", ["view"]);
  await grantUI(mentor.id, "Drawer", [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.student.report",
    "nav.tinkering-activity.report",
    "nav.competition.report",
    "nav.course.report",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "action.logout",
  ]);
  await grantUI(mentor.id, "StudentReport", [
    "table",
    "tool.quick-filter",
    "tool.column-visibility",
    "column.first_name",
    "column.last_name",
    "column.email",
    "column.school",
    "column.class",
    "column.section",
    "column.aspiration",
    "row.click-detail",
    "row.view-snapshot",
    "row.open-calendar",
    "filter.school",
    "filter.class",
    "detail.drawer",
  ]);
  await grantUI(mentor.id, "TaskReport", "*");
  await grantUI(mentor.id, "TaskForm", "*");
  await grantUI(mentor.id, "TinkeringActivityReport", "*");
  await grantUI(mentor.id, "CompetitionReport", "*");
  await grantUI(mentor.id, "CourseReport", "*");
  await grantUI(mentor.id, "Snapshot", "*");
  await grantUI(mentor.id, "Notifications", "*");
  await grantUI(mentor.id, "Calendar", "*");
  await grantUI(mentor.id, "Chats", "*");
  await grantUI(mentor.id, "ChatRoom", "*");

  await grantModel(student.id, "Task", ["view"]);
  await grantModel(student.id, "Notification", ["view"]);
  await grantModel(student.id, "Booking", ["view", "create"]);
  await grantModel(student.id, "Schedule", ["view"]);
  await grantModel(student.id, "ChatRoom", ["view"]);
  await grantModel(student.id, "Message", ["view", "create"]);
  await grantModel(student.id, "TinkeringActivity", ["view"]);
  await grantModel(student.id, "Competition", ["view"]);
  await grantModel(student.id, "Course", ["view"]);
  await grantUI(student.id, "Drawer", [
    "nav.student-snapshot",
    "nav.tasks",
    "nav.calendar",
    "nav.chats",
    "nav.notifications",
    "action.logout",
  ]);
  await grantUI(student.id, "Snapshot", [
    "tab.tinkering",
    "tab.competition",
    "tab.courses",
    "tab.tasks",
    "row.view",
    "action.update-status",
    "action.attach-file",
    "field.status",
    "field.comments",
    "field.attachments",
    "modal.edit-tinkering",
    "modal.edit-competition",
    "modal.edit-course",
    "modal.status",
  ]);
  await grantUI(student.id, "TaskReport", [
    "table",
    "tab.assigned",
    "tool.quick-filter",
    "column.title",
    "column.school",
    "column.created_by",
    "column.status",
    "column.due_date",
    "row.click-detail",
    "row.mark-complete",
    "filter.status",
    "detail.drawer",
  ]);
  await grantUI(student.id, "Notifications", "*");
  await grantUI(student.id, "Calendar", [
    "view.day",
    "view.week",
    "view.month",
    "date-picker",
    "booking.list",
    "booking.detail",
    "booking.cancel",
  ]);
  await grantUI(student.id, "Chats", "*");
  await grantUI(student.id, "ChatRoom", "*");

  const totalPerms = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const totalRolePerms = await prisma.rolePermission.count();
  console.log("RBAC seed completed.");
  console.log(`  roles:            ${totalRoles}`);
  console.log(`  permissions:      ${totalPerms}`);
  console.log(`  role-permissions: ${totalRolePerms}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
