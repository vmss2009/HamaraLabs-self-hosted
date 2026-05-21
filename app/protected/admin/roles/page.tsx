"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridToolbarQuickFilter,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Switch,
  Alert,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FiEdit2, FiTrash2, FiShield, FiPlus } from "react-icons/fi";
import ReportShell from "@/components/form/ReportShell";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  permission_count: number;
}

interface Permission {
  id: string;
  action: string;
  subject: string;
  field: string;
  description: string | null;
  inverted: boolean;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formRole, setFormRole] = useState<RoleRow | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [permRole, setPermRole] = useState<RoleRow | null>(null);
  const [assignedIds, setAssignedIds] = useState(new Set<string>());
  const [permLoading, setPermLoading] = useState(false);
  const [permSubjectFilter, setPermSubjectFilter] = useState("");
  const [permActionFilter, setPermActionFilter] = useState("");
  const [permAssignedOnly, setPermAssignedOnly] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error("Failed");
      setRoles(await res.json());
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (!res.ok) return;
      setAllPermissions(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, [fetchRoles, fetchAllPermissions]);

  const openCreate = () => {
    setFormRole(null);
    setFormData({ name: "", description: "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setFormRole(role);
    setFormData({ name: role.name, description: role.description ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSave = async () => {
    if (!formData.name.trim()) {
      setFormError("Role name is required");
      return;
    }
    setFormSaving(true);
    setFormError(null);
    try {
      if (formRole) {
        const res = await fetch(`/api/admin/roles/${formRole.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, description: formData.description || null }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? "Failed to update role");
        }
      } else {
        const res = await fetch("/api/admin/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, description: formData.description || null }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? "Failed to create role");
        }
        const created = await res.json();
        setFormOpen(false);
        await fetchRoles();
        openPermissions({
          id: created.id,
          name: created.name,
          description: created.description ?? null,
          is_system: created.is_system,
          created_at: created.created_at,
          permission_count: 0,
        });
        return;
      }
      setFormOpen(false);
      await fetchRoles();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save role");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRoleTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${deleteRoleTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to delete role");
      }
      setDeleteRoleTarget(null);
      await fetchRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete role");
      setDeleteRoleTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openPermissions = async (role: RoleRow) => {
    setPermRole(role);
    setPermLoading(true);
    setPermSubjectFilter("");
    setPermActionFilter("");
    setPermAssignedOnly(false);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssignedIds(new Set<string>(data.assigned_permission_ids as string[]));
    } catch {
      setError("Failed to load role permissions");
    } finally {
      setPermLoading(false);
    }
  };

  const handlePermToggle = useCallback(
    async (permId: string) => {
      if (!permRole) return;
      const isAssigned = assignedIds.has(permId);

      setAssignedIds((prev) => {
        const next = new Set(prev);
        if (isAssigned) next.delete(permId);
        else next.add(permId);
        return next;
      });

      try {
        const res = await fetch(`/api/admin/roles/${permRole.id}/permissions`, {
          method: isAssigned ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionId: permId }),
        });
        if (!res.ok) throw new Error();
        fetchRoles();
      } catch {
        setAssignedIds((prev) => {
          const next = new Set(prev);
          if (isAssigned) next.add(permId);
          else next.delete(permId);
          return next;
        });
      }
    },
    [permRole, assignedIds, fetchRoles],
  );

  const subjects = useMemo(
    () => Array.from(new Set(allPermissions.map((p) => p.subject))).sort(),
    [allPermissions],
  );
  const actions = useMemo(
    () => Array.from(new Set(allPermissions.map((p) => p.action))).sort(),
    [allPermissions],
  );

  const filteredPermissions = useMemo(
    () =>
      allPermissions.filter((p) => {
        if (permSubjectFilter && p.subject !== permSubjectFilter) return false;
        if (permActionFilter && p.action !== permActionFilter) return false;
        if (permAssignedOnly && !assignedIds.has(p.id)) return false;
        return true;
      }),
    [allPermissions, permSubjectFilter, permActionFilter, permAssignedOnly, assignedIds],
  );

  const permColumns = useMemo<GridColDef[]>(
    () => [
      { field: "subject", headerName: "Subject", width: 180 },
      { field: "action", headerName: "Action", width: 120 },
      {
        field: "field",
        headerName: "Field / Key",
        width: 220,
        valueGetter: (value: unknown) => (value as string) || "(model-level)",
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        valueGetter: (value: unknown) => (value as string | null) ?? "",
      },
      {
        field: "assigned",
        headerName: "Assigned",
        width: 100,
        renderCell: (params) => (
          <Switch
            checked={assignedIds.has(params.row.id as string)}
            onChange={() => handlePermToggle(params.row.id as string)}
            size="small"
            color="primary"
          />
        ),
        sortable: false,
        filterable: false,
      },
    ],
    [assignedIds, handlePermToggle],
  );

  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "#",
      width: 60,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "name", headerName: "Role Name", width: 180 },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      valueGetter: (value: unknown) => (value as string | null) ?? "-",
    },
    {
      field: "is_system",
      headerName: "Type",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="System" size="small" color="warning" variant="outlined" />
        ) : (
          <Chip label="Custom" size="small" color="default" variant="outlined" />
        ),
    },
    {
      field: "permission_count",
      headerName: "Permissions",
      width: 120,
      renderCell: (params) => (
        <Chip label={String(params.value)} size="small" color="info" variant="outlined" />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams<RoleRow>) => {
        const acts = [
          <GridActionsCellItem
            key="perms"
            icon={<FiShield />}
            label="Manage Permissions"
            onClick={() => openPermissions(params.row)}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<FiEdit2 />}
            label="Edit"
            onClick={() => openEdit(params.row)}
          />,
        ];
        if (!params.row.is_system) {
          acts.push(
            <GridActionsCellItem
              key="delete"
              icon={<FiTrash2 />}
              label="Delete"
              onClick={() => setDeleteRoleTarget(params.row)}
              color="error"
              showInMenu
            />,
          );
        }
        return acts;
      },
    },
  ];

  return (
    <ReportShell>
      <div className="px-10 pb-10">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Role Management</h1>
          <Button variant="contained" startIcon={<FiPlus />} onClick={openCreate}>
            Create Role
          </Button>
        </div>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm">
          <DataGrid
            rows={roles}
            columns={columns}
            loading={loading}
            rowHeight={52}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{
              toolbar: () => (
                <GridToolbarContainer className="bg-gray-50 p-2">
                  <GridToolbarQuickFilter sx={{ width: "100%" }} />
                </GridToolbarContainer>
              ),
            }}
            sx={{ border: "none", borderRadius: "12px" }}
          />
        </div>
      </div>

      {/* Create / Edit Role Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formRole ? "Edit Role" : "Create Role"}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            required
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            margin="normal"
            helperText="Lowercase with underscores, e.g. lab_assistant"
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleFormSave} variant="contained" disabled={formSaving}>
            {formSaving ? "Saving..." : formRole ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteRoleTarget}
        onClose={() => setDeleteRoleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Delete role <strong>{deleteRoleTarget?.name}</strong>? All permission assignments for
            this role will be removed and users with this role will lose those permissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRoleTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog
        open={!!permRole}
        onClose={() => setPermRole(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>
            Permissions for: <strong>{permRole?.name}</strong>
          </span>
          <Chip
            label={`${assignedIds.size} assigned`}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 0, overflow: "hidden" }}
        >
          {permLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", pt: 1 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={permSubjectFilter}
                    onChange={(e) => setPermSubjectFilter(e.target.value)}
                    label="Subject"
                  >
                    <MenuItem value="">All subjects</MenuItem>
                    {subjects.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={permActionFilter}
                    onChange={(e) => setPermActionFilter(e.target.value)}
                    label="Action"
                  >
                    <MenuItem value="">All actions</MenuItem>
                    {actions.map((a) => (
                      <MenuItem key={a} value={a}>
                        {a}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant={permAssignedOnly ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setPermAssignedOnly((v) => !v)}
                >
                  Assigned only ({assignedIds.size})
                </Button>

                <Button
                  size="small"
                  onClick={() => {
                    setPermSubjectFilter("");
                    setPermActionFilter("");
                    setPermAssignedOnly(false);
                  }}
                >
                  Clear filters
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                  {filteredPermissions.length} of {allPermissions.length} shown
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGrid
                  rows={filteredPermissions}
                  columns={permColumns}
                  rowHeight={42}
                  initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
                  pageSizeOptions={[50, 100, 200]}
                  disableRowSelectionOnClick
                  sx={{ border: "none", height: "100%" }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermRole(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ReportShell>
  );
}
