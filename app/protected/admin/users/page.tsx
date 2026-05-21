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
import { FiEdit2, FiTrash2, FiShield, FiPlus, FiKey } from "react-icons/fi";
import ReportShell from "@/components/form/ReportShell";

const DERIVED_ROLES = new Set(["principal", "incharge", "correspondent", "mentor", "student"]);

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  user_meta_data: Record<string, unknown> | null;
  created_at: string;
  schools: string[];
}

interface RoleOption {
  id: string;
  name: string;
  description: string | null;
}

interface Permission {
  id: string;
  action: string;
  subject: string;
  field: string;
  description: string | null;
  inverted: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", first_name: "", last_name: "" });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null);

  // Permission dialog — three independent sets
  const [permUser, setPermUser] = useState<AdminUser | null>(null);
  const [roleGrantedIds, setRoleGrantedIds] = useState(new Set<string>());
  const [customGrantedIds, setCustomGrantedIds] = useState(new Set<string>());
  const [customDeniedIds, setCustomDeniedIds] = useState(new Set<string>());
  const [permLoading, setPermLoading] = useState(false);
  const [permResetting, setPermResetting] = useState(false);
  const [permSubjectFilter, setPermSubjectFilter] = useState("");
  const [permActionFilter, setPermActionFilter] = useState("");
  const [permEffectiveOnly, setPermEffectiveOnly] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Derived: a permission is ON if role or custom grants it AND not denied
  const isEffectivelyOn = useCallback(
    (id: string) =>
      !customDeniedIds.has(id) && (roleGrantedIds.has(id) || customGrantedIds.has(id)),
    [roleGrantedIds, customGrantedIds, customDeniedIds],
  );

  const effectiveCount = useMemo(
    () => allPermissions.filter((p) => isEffectivelyOn(p.id)).length,
    [allPermissions, isEffectivelyOn],
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) setRoles(await res.json());
    } catch {}
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) setAllPermissions(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchAllPermissions();
  }, [fetchUsers, fetchRoles, fetchAllPermissions]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.email.trim()) { setCreateError("Email is required"); return; }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createForm.email.trim(),
          first_name: createForm.first_name.trim() || undefined,
          last_name: createForm.last_name.trim() || undefined,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? "Failed"); }
      setCreateOpen(false);
      setCreateForm({ email: "", first_name: "", last_name: "" });
      await fetchUsers();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create user");
    } finally { setCreating(false); }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({ first_name: user.first_name ?? "", last_name: user.last_name ?? "" });
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editUser) return;
    setEditing(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editForm.first_name.trim() || undefined,
          last_name: editForm.last_name.trim() || undefined,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? "Failed"); }
      setEditUser(null);
      await fetchUsers();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to update user");
    } finally { setEditing(false); }
  };

  // ── Roles ────────────────────────────────────────────────────────────────────

  const handleRoleToggle = async (userId: string, role: string, hasRole: boolean) => {
    const method = hasRole ? "DELETE" : "POST";
    const updater = (u: AdminUser) => ({
      ...u,
      roles: hasRole ? u.roles.filter((r) => r !== role) : [...u.roles, role],
    });
    setRolesUser((prev) => prev && prev.id === userId ? updater(prev) : prev);
    setUsers((prev) => prev.map((u) => u.id === userId ? updater(u) : u));
    try {
      await fetch(`/api/admin/users/${userId}/roles`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch { await fetchUsers(); }
  };

  // ── Permissions ───────────────────────────────────────────────────────────────

  const openPermissions = async (user: AdminUser) => {
    setPermUser(user);
    setPermLoading(true);
    setPermSubjectFilter("");
    setPermActionFilter("");
    setPermEffectiveOnly(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/permissions`);
      if (!res.ok) throw new Error();
      const data: { roleGrantedIds: string[]; customGrantedIds: string[]; customDeniedIds: string[] } =
        await res.json();
      setRoleGrantedIds(new Set(data.roleGrantedIds));
      setCustomGrantedIds(new Set(data.customGrantedIds));
      setCustomDeniedIds(new Set(data.customDeniedIds));
    } catch {
      setError("Failed to load permissions");
    } finally { setPermLoading(false); }
  };

  const handlePermToggle = useCallback(
    async (permId: string) => {
      if (!permUser) return;
      const on = !customDeniedIds.has(permId) && (roleGrantedIds.has(permId) || customGrantedIds.has(permId));

      if (!on) {
        // Turn ON
        if (customDeniedIds.has(permId)) {
          // Remove deny override → restores role grant
          setCustomDeniedIds((prev) => { const n = new Set(prev); n.delete(permId); return n; });
          await fetch(`/api/admin/users/${permUser.id}/permissions`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissionId: permId }),
          });
        } else {
          // Add custom grant
          setCustomGrantedIds((prev) => new Set([...prev, permId]));
          await fetch(`/api/admin/users/${permUser.id}/permissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissionId: permId, inverted: false }),
          });
        }
      } else {
        // Turn OFF
        if (customGrantedIds.has(permId)) {
          // Remove custom grant
          setCustomGrantedIds((prev) => { const n = new Set(prev); n.delete(permId); return n; });
          await fetch(`/api/admin/users/${permUser.id}/permissions`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissionId: permId }),
          });
          // If role still grants it, add a deny so it's truly OFF
          if (roleGrantedIds.has(permId)) {
            setCustomDeniedIds((prev) => new Set([...prev, permId]));
            await fetch(`/api/admin/users/${permUser.id}/permissions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ permissionId: permId, inverted: true }),
            });
          }
        } else if (roleGrantedIds.has(permId)) {
          // Add deny override
          setCustomDeniedIds((prev) => new Set([...prev, permId]));
          await fetch(`/api/admin/users/${permUser.id}/permissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissionId: permId, inverted: true }),
          });
        }
      }
    },
    [permUser, roleGrantedIds, customGrantedIds, customDeniedIds],
  );

  const handleResetToRole = async () => {
    if (!permUser) return;
    setPermResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${permUser.id}/permissions/reset`, { method: "POST" });
      if (!res.ok) throw new Error();
      setCustomGrantedIds(new Set());
      setCustomDeniedIds(new Set());
    } catch {
      setError("Failed to reset permissions");
    } finally {
      setPermResetting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? "Failed"); }
      setDeleteTarget(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  // ── Permission filter / columns ───────────────────────────────────────────────

  const permSubjects = useMemo(
    () => Array.from(new Set(allPermissions.map((p) => p.subject))).sort(),
    [allPermissions],
  );
  const permActions = useMemo(
    () => Array.from(new Set(allPermissions.map((p) => p.action))).sort(),
    [allPermissions],
  );

  const filteredPermissions = useMemo(
    () =>
      allPermissions.filter((p) => {
        if (permSubjectFilter && p.subject !== permSubjectFilter) return false;
        if (permActionFilter && p.action !== permActionFilter) return false;
        if (permEffectiveOnly && !isEffectivelyOn(p.id)) return false;
        return true;
      }),
    [allPermissions, permSubjectFilter, permActionFilter, permEffectiveOnly, isEffectivelyOn],
  );

  const permColumns = useMemo<GridColDef[]>(
    () => [
      { field: "subject", headerName: "Subject", width: 160 },
      { field: "action", headerName: "Action", width: 110 },
      {
        field: "field",
        headerName: "Field / Key",
        width: 210,
        valueGetter: (v: unknown) => (v as string) || "(model-level)",
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        valueGetter: (v: unknown) => (v as string | null) ?? "",
      },
      {
        field: "source",
        headerName: "Source",
        width: 110,
        renderCell: (params) => {
          const id = params.row.id as string;
          if (customDeniedIds.has(id))
            return <Chip label="denied" size="small" color="error" variant="outlined" />;
          if (customGrantedIds.has(id) && roleGrantedIds.has(id))
            return <Chip label="role+custom" size="small" color="success" variant="outlined" />;
          if (customGrantedIds.has(id))
            return <Chip label="custom" size="small" color="secondary" variant="outlined" />;
          if (roleGrantedIds.has(id))
            return <Chip label="role" size="small" color="primary" variant="outlined" />;
          return null;
        },
        sortable: false,
        filterable: false,
      },
      {
        field: "on",
        headerName: "On / Off",
        width: 90,
        renderCell: (params) => (
          <Switch
            checked={isEffectivelyOn(params.row.id as string)}
            onChange={() => handlePermToggle(params.row.id as string)}
            size="small"
          />
        ),
        sortable: false,
        filterable: false,
      },
    ],
    [roleGrantedIds, customGrantedIds, customDeniedIds, isEffectivelyOn, handlePermToggle],
  );

  // ── Grid columns ─────────────────────────────────────────────────────────────

  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "#",
      width: 60,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: "email", headerName: "Email", width: 240 },
    {
      field: "name",
      headerName: "Name",
      width: 180,
      valueGetter: (_v: unknown, row: AdminUser) =>
        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "-",
    },
    {
      field: "roles",
      headerName: "Roles",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.5 }}>
          {(params.value as string[]).map((r) => (
            <Chip key={r} label={r} size="small"
              color={DERIVED_ROLES.has(r) ? "default" : "primary"} variant="outlined" />
          ))}
          {(params.value as string[]).length === 0 && (
            <span className="text-gray-400 text-sm">No roles</span>
          )}
        </Box>
      ),
    },
    {
      field: "isAdmin",
      headerName: "Admin",
      width: 90,
      valueGetter: (_v: unknown, row: AdminUser) => row.roles.includes("admin"),
      renderCell: (params) => (
        <Chip label={params.value ? "Admin" : "User"} size="small"
          color={params.value ? "error" : "default"} />
      ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 130,
      valueFormatter: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : "-",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 140,
      getActions: (params: GridRowParams<AdminUser>) => [
        <GridActionsCellItem key="edit" icon={<FiEdit2 />} label="Edit"
          onClick={() => openEdit(params.row)} />,
        <GridActionsCellItem key="roles" icon={<FiShield />} label="Manage Roles"
          onClick={() => setRolesUser({ ...params.row })} />,
        <GridActionsCellItem key="perms" icon={<FiKey />} label="Permissions"
          onClick={() => openPermissions(params.row)} showInMenu />,
        <GridActionsCellItem key="delete" icon={<FiTrash2 />} label="Delete"
          onClick={() => setDeleteTarget(params.row)} color="error" showInMenu />,
      ],
    },
  ];

  return (
    <ReportShell>
      <div className="px-10 pb-10">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <Button variant="contained" startIcon={<FiPlus />}
            onClick={() => { setCreateOpen(true); setCreateError(null); }}>
            Create User
          </Button>
        </div>

        {error && <Alert severity="error" className="mb-4" onClose={() => setError(null)}>{error}</Alert>}

        <div className="bg-white rounded-xl shadow-sm">
          <DataGrid rows={users} columns={columns} loading={loading} rowHeight={52}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick
            slots={{ toolbar: () => (
              <GridToolbarContainer className="bg-gray-50 p-2">
                <GridToolbarQuickFilter sx={{ width: "100%" }} />
              </GridToolbarContainer>
            )}}
            sx={{ border: "none", borderRadius: "12px" }}
          />
        </div>
      </div>

      {/* ── Create ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          <TextField autoFocus fullWidth required label="Email" type="email"
            value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} margin="normal" />
          <TextField fullWidth label="First Name"
            value={createForm.first_name} onChange={(e) => setCreateForm((f) => ({ ...f, first_name: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Last Name"
            value={createForm.last_name} onChange={(e) => setCreateForm((f) => ({ ...f, last_name: e.target.value }))} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit ── */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>{editUser?.email}</Typography>
          <TextField autoFocus fullWidth label="First Name"
            value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Last Name"
            value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={editing}>
            {editing ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Manage Roles ── */}
      <Dialog open={!!rolesUser} onClose={() => setRolesUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Roles — {rolesUser?.email}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Toggle roles. Changes apply immediately.
          </Typography>
          <div className="flex flex-col gap-2">
            {roles.map((role) => {
              const hasRole = rolesUser?.roles.includes(role.name) ?? false;
              return (
                <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium text-gray-800">{role.name}</span>
                    {role.description && <span className="text-sm text-gray-500 ml-2">— {role.description}</span>}
                  </div>
                  <Switch checked={hasRole} size="small"
                    onChange={() => rolesUser && handleRoleToggle(rolesUser.id, role.name, hasRole)} />
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolesUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Permissions ── */}
      <Dialog open={!!permUser} onClose={() => setPermUser(null)} maxWidth="xl" fullWidth
        PaperProps={{ sx: { height: "90vh" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>Permissions — <strong>{permUser?.email}</strong></span>
          <Chip label={`${effectiveCount} effective`} size="small" color="primary" sx={{ ml: 1 }} />
          {customDeniedIds.size > 0 && (
            <Chip label={`${customDeniedIds.size} denied`} size="small" color="error" sx={{ ml: 0.5 }} />
          )}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 0, overflow: "hidden" }}>
          {permLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <Alert severity="info" sx={{ mt: 1 }}>
                <strong>role</strong> = granted by a role &nbsp;|&nbsp;
                <strong>custom</strong> = granted directly to this user &nbsp;|&nbsp;
                <strong>denied</strong> = explicitly blocked for this user (overrides role).
                Toggle any permission on or off — changes apply immediately.
              </Alert>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Subject</InputLabel>
                  <Select value={permSubjectFilter} onChange={(e) => setPermSubjectFilter(e.target.value)} label="Subject">
                    <MenuItem value="">All subjects</MenuItem>
                    {permSubjects.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Action</InputLabel>
                  <Select value={permActionFilter} onChange={(e) => setPermActionFilter(e.target.value)} label="Action">
                    <MenuItem value="">All actions</MenuItem>
                    {permActions.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>

                <Button variant={permEffectiveOnly ? "contained" : "outlined"} size="small"
                  onClick={() => setPermEffectiveOnly((v) => !v)}>
                  Effective only ({effectiveCount})
                </Button>

                <Button size="small" onClick={() => { setPermSubjectFilter(""); setPermActionFilter(""); setPermEffectiveOnly(false); }}>
                  Clear
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  disabled={permResetting || (customGrantedIds.size === 0 && customDeniedIds.size === 0)}
                  onClick={handleResetToRole}
                >
                  {permResetting ? "Resetting..." : `Reset to Role (${customGrantedIds.size + customDeniedIds.size} overrides)`}
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                  {filteredPermissions.length} of {allPermissions.length} shown
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGrid rows={filteredPermissions} columns={permColumns} rowHeight={42}
                  initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
                  pageSizeOptions={[50, 100, 200]} disableRowSelectionOnClick
                  sx={{ border: "none", height: "100%" }} />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteTarget?.email}</strong>? This also removes their Authentik account and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ReportShell>
  );
}
