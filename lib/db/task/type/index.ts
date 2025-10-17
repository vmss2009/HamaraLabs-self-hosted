export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | string | null;
  studentId?: string | null;
  assignedToId?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | string | null;
  studentId?: string | null;
  assignedToId?: string | null;
}

export interface TaskFilter {
  studentId?: string;
  assignedToId?: string;
  createdById?: string;
  excludeCreatorId?: string;
  status?: TaskStatus[];
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  studentId: string | null;
  assignedToId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithRelations extends TaskRecord {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    school_id: string;
  } | null;
  createdBy: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  assignedTo?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}
