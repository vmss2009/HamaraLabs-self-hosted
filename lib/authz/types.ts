import { PureAbility, type AbilityClass, type RawRuleOf } from "@casl/ability";

export type AppAction =
  | "manage"
  | "view"
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "bulk-delete"
  | "approve"
  | "reject"
  | (string & {});

export type AppSubject =
  | "all"
  | "User"
  | "Role"
  | "Permission"
  | "School"
  | "Student"
  | "Mentor"
  | "Task"
  | "Course"
  | "Competition"
  | "CustomisedCourse"
  | "CustomisedCompetition"
  | "CustomisedTinkeringActivity"
  | "TinkeringActivity"
  | "SchoolVisit"
  | "Hub"
  | "Cluster"
  | "Notification"
  | "Booking"
  | "Schedule"
  | "Message"
  | "ChatRoom"
  | "Drawer"
  | "SchoolForm"
  | "SchoolReport"
  | "StudentForm"
  | "StudentReport"
  | "MentorForm"
  | "MentorReport"
  | "TaskForm"
  | "TaskReport"
  | "SchoolVisitForm"
  | "SchoolVisitReport"
  | "ClusterForm"
  | "ClusterReport"
  | "TinkeringActivityForm"
  | "TinkeringActivityReport"
  | "CompetitionForm"
  | "CompetitionReport"
  | "CourseForm"
  | "CourseReport"
  | "Snapshot"
  | "Sarthi"
  | "Dashboard"
  | "Chats"
  | "ChatRoom"
  | "Calendar"
  | "Notifications"
  | "AdminUsers"
  | "AdminRoles"
  | "AdminPermissions"
  | (string & {});

export type SerializedRule = {
  action: AppAction | AppAction[];
  subject: AppSubject | AppSubject[];
  fields?: string[];
  conditions?: Record<string, unknown>;
  inverted?: boolean;
  reason?: string;
};

export type AppAbility = PureAbility<[AppAction, AppSubject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export type AppRule = RawRuleOf<AppAbility>;

export type SubjectShape = { __type: AppSubject } & Record<string, unknown>;
