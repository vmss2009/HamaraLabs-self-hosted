"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import Modal from "@/components/form/Modal";
import { Button } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Input } from "@/components/form/Input";
import type { TaskStatus } from "@/lib/db/task/type";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  studentId: string | null;
  createdBy: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  assignedTo: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type StudentOption = {
  id: string;
  first_name: string;
  last_name: string;
};

type SchoolOption = {
  id: string;
  name: string;
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

function formatDate(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString();
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<"assigned" | "created">("assigned");
  const [assignedTasks, setAssignedTasks] = useState<TaskRow[]>([]);
  const [createdTasks, setCreatedTasks] = useState<TaskRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    schoolId: "",
    studentId: "",
    assignedToEmail: "",
    dueDate: "",
  });

  const fetchSchools = useCallback(async () => {
    try {
      const res = await fetch("/api/schools");
      if (!res.ok) {
        throw new Error("Failed to load schools");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const options = data
          .map((school: any) => ({
            id: school.id,
            name: school.name,
          }))
          .filter((school) => school.id && school.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setSchools(options);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchStudentsForSchool = useCallback(async (schoolId: string) => {
    if (!schoolId) {
      setStudents([]);
      return;
    }

    try {
      const params = new URLSearchParams({ schoolId });
      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load students");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = [...data]
          .map((student: any) => ({
            id: student.id,
            first_name: student.first_name ?? "",
            last_name: student.last_name ?? "",
          }))
          .filter((student) => student.id)
          .sort((a, b) => {
            const nameA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
            return nameA.localeCompare(nameB);
          });
        setStudents(mapped);
      } else {
        setStudents([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchTasks = useCallback(
    async (view: "assigned" | "created") => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ view });
        const res = await fetch(`/api/tasks?${params.toString()}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch tasks");
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response");
        }
        if (view === "assigned") {
          setAssignedTasks(data as TaskRow[]);
        } else {
          setCreatedTasks(data as TaskRow[]);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    fetchTasks("assigned");
    fetchTasks("created");
  }, [fetchTasks]);

  const handleStatusChange = useCallback(
    async (task: TaskRow, next: TaskStatus) => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(detail || "Failed to update task");
        }
        await fetchTasks("assigned");
        await fetchTasks("created");
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to update task");
      }
    },
    [fetchTasks]
  );

  const handleDelete = useCallback(
    async (task: TaskRow) => {
      if (!confirm("Delete this task?")) return;
      try {
        const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(detail || "Failed to delete task");
        }
        await fetchTasks("assigned");
        await fetchTasks("created");
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to delete task");
      }
    },
    [fetchTasks]
  );

  const columnsAssigned: GridColDef[] = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "student",
        headerName: "Student",
        flex: 1,
        minWidth: 160,
        valueGetter: (params) =>
          (params as any).row.student
            ? `${(params as any).row.student.first_name} ${(params as any).row.student.last_name}`
            : "",
      },
      {
        field: "createdBy",
        headerName: "Created By",
        minWidth: 180,
        valueGetter: (params) => (params as any).row.createdBy.email,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        valueFormatter: (params) => STATUS_LABEL[(params as any).value as TaskStatus] ?? (params as any).value,
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        minWidth: 140,
        valueGetter: (params) => formatDate((params as any).row.dueDate),
      },
      {
        field: "actions",
        type: "actions",
        width: 180,
        getActions: (params) => {
          const current = (params as any).row.status as TaskStatus;
          const actions: React.ReactNode[] = [];
          if (current !== "COMPLETED") {
            actions.push(
              <GridActionsCellItem
                key="complete"
                label="Mark complete"
                showInMenu={false}
                onClick={() => handleStatusChange((params as any).row, "COMPLETED")}
                icon={<span className="text-sm font-semibold text-green-600">Done</span>}
              />
            );
          }
          if (current === "COMPLETED") {
            actions.push(
              <GridActionsCellItem
                key="reopen"
                label="Reopen"
                showInMenu={false}
                onClick={() => handleStatusChange((params as any).row, "IN_PROGRESS")}
                icon={<span className="text-sm font-semibold text-blue-600">Reopen</span>}
              />
            );
          }
          return actions as any;
        },
      },
    ],
    [handleStatusChange]
  );

  const columnsCreated: GridColDef[] = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "student",
        headerName: "Student",
        flex: 1,
        minWidth: 160,
        valueGetter: (params) =>
          (params as any).row.student
            ? `${(params as any).row.student.first_name} ${(params as any).row.student.last_name}`
            : "",
      },
      {
        field: "assignedTo",
        headerName: "Assigned To",
        minWidth: 180,
        valueGetter: (params) => (params as any).row.assignedTo?.email ?? "Unassigned",
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        valueFormatter: (params) => STATUS_LABEL[(params as any).value as TaskStatus] ?? (params as any).value,
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        minWidth: 140,
        valueGetter: (params) => formatDate((params as any).row.dueDate),
      },
      {
        field: "actions",
        type: "actions",
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="delete"
            label="Delete"
            showInMenu={false}
            onClick={() => handleDelete((params as any).row)}
            icon={<span className="text-sm font-semibold text-red-600">Delete</span>}
          />,
        ],
      },
    ],
    [handleDelete]
  );

  const rows = activeTab === "assigned" ? assignedTasks : createdTasks;
  const columns = activeTab === "assigned" ? columnsAssigned : columnsCreated;

  const openCreateModal = () => {
    setFormState({
      title: "",
      description: "",
      schoolId: "",
      studentId: "",
      assignedToEmail: "",
      dueDate: "",
    });
    setStudents([]);
    setCreateOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        studentId: formState.studentId || null,
        assignedToEmail: formState.assignedToEmail.trim() || undefined,
        dueDate: formState.dueDate || null,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        const message = typeof detail?.message === "string" ? detail.message : "Failed to create task";
        throw new Error(message);
      }

      setCreateOpen(false);
      await fetchTasks("assigned");
      await fetchTasks("created");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
        <Button variant="default" onClick={openCreateModal}>
          New Task
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          variant={activeTab === "assigned" ? "default" : "outline"}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned to me
        </Button>
        <Button
          variant={activeTab === "created" ? "default" : "outline"}
          onClick={() => setActiveTab("created")}
        >
          Created by me
        </Button>
      </div>

      {error && (
        <Alert type="error" className="flex items-center justify-between">
          <span>{error}</span>
          <button
            className="text-sm font-semibold text-red-600 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </Alert>
      )}

      <div className="bg-gray-50 rounded-xl shadow-sm">
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            borderRadius: "20px",
            backgroundColor: "#f3f4f6",
            "& .MuiDataGrid-cell": {
              color: "#1f2937",
              paddingTop: "10px",
              paddingBottom: "10px",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#eef2ff",
              color: "#1f2937",
            },
          }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer className="bg-gray-50 p-2">
                <GridToolbarQuickFilter sx={{ width: "100%" }} />
              </GridToolbarContainer>
            ),
          }}
        />
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create task"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              value={formState.title}
              onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
              placeholder="Follow up with student"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formState.description}
              onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
            />
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">School</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formState.schoolId}
                onChange={(e) => {
                  const nextSchoolId = e.target.value;
                  setFormState((s) => ({ ...s, schoolId: nextSchoolId, studentId: "" }));
                  if (nextSchoolId) {
                    fetchStudentsForSchool(nextSchoolId);
                  } else {
                    setStudents([]);
                  }
                }}
              >
                <option value="">-- Select school --</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Student</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formState.studentId}
                onChange={(e) => setFormState((s) => ({ ...s, studentId: e.target.value }))}
                disabled={!formState.schoolId}
            >
              <option value="">-- None --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assign to (email)</label>
            <Input
              value={formState.assignedToEmail}
              onChange={(e) => setFormState((s) => ({ ...s, assignedToEmail: e.target.value }))}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Due date</label>
            <Input
              type="date"
              value={formState.dueDate}
              onChange={(e) => setFormState((s) => ({ ...s, dueDate: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
