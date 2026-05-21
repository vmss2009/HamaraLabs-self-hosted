import { prisma } from "./prisma";
import { Prisma, type Permission, type Role } from "@prisma/client";

export type PermissionRow = Permission;
export type RoleRow = Role;

export async function getRulesForUser(userId: string): Promise<{
  user:
    | {
        id: string;
        email: string;
        schools: string[];
        roles: string[];
        user_meta_data: Record<string, unknown> | null;
      }
    | null;
  permissions: Permission[];
}> {
  const rawUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      schools: true,
      roles: true,
      user_meta_data: true,
    },
  });
  if (!rawUser) {
    return { user: null, permissions: [] };
  }
  const user = {
    ...rawUser,
    user_meta_data:
      (rawUser.user_meta_data as Record<string, unknown> | null) ?? null,
  };

  if (user.roles.length === 0) {
    return { user, permissions: [] };
  }

  const rolesWithPerms = await prisma.role.findMany({
    where: { name: { in: user.roles } },
    include: { role_permissions: { include: { permission: true } } },
  });

  const seen = new Set<string>();
  const permissions: Permission[] = [];
  for (const role of rolesWithPerms) {
    for (const rp of role.role_permissions) {
      if (seen.has(rp.permission.id)) continue;
      seen.add(rp.permission.id);
      permissions.push(rp.permission);
    }
  }

  return { user, permissions };
}

export async function listRoles(): Promise<Role[]> {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}

export async function listPermissions(): Promise<Permission[]> {
  return prisma.permission.findMany({
    orderBy: [{ subject: "asc" }, { action: "asc" }, { field: "asc" }],
  });
}

export async function assignRoleToUser(userId: string, roleName: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!user) throw new Error(`User ${userId} not found`);
  if (user.roles.includes(roleName)) return user;
  return prisma.user.update({
    where: { id: userId },
    data: { roles: { set: [...user.roles, roleName] } },
    select: { id: true, roles: true },
  });
}

export async function removeRoleFromUser(userId: string, roleName: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!user) throw new Error(`User ${userId} not found`);
  return prisma.user.update({
    where: { id: userId },
    data: { roles: { set: user.roles.filter((r) => r !== roleName) } },
    select: { id: true, roles: true },
  });
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  return u?.roles ?? [];
}

export async function addPermissionToRole(roleId: string, permissionId: string) {
  return prisma.rolePermission.upsert({
    where: {
      role_id_permission_id: { role_id: roleId, permission_id: permissionId },
    },
    create: { role_id: roleId, permission_id: permissionId },
    update: {},
  });
}

export async function removePermissionFromRole(
  roleId: string,
  permissionId: string,
) {
  return prisma.rolePermission.deleteMany({
    where: { role_id: roleId, permission_id: permissionId },
  });
}

export async function upsertPermission(input: {
  action: string;
  subject: string;
  field?: string | null;
  conditions?: Record<string, unknown> | null;
  inverted?: boolean;
  reason?: string | null;
  description?: string | null;
}): Promise<Permission> {
  const { action, subject, field, conditions, inverted, reason, description } =
    input;
  const fieldKey = field ?? "";
  const conditionsJson = (conditions ?? undefined) as
    | Prisma.InputJsonValue
    | undefined;
  return prisma.permission.upsert({
    where: {
      action_subject_field: { action, subject, field: fieldKey },
    },
    create: {
      action,
      subject,
      field: fieldKey,
      conditions: conditionsJson,
      inverted: inverted ?? false,
      reason: reason ?? undefined,
      description: description ?? undefined,
    },
    update: {
      conditions: conditionsJson,
      inverted: inverted ?? false,
      reason: reason ?? undefined,
      description: description ?? undefined,
    },
  });
}

export async function upsertRole(input: {
  name: string;
  description?: string | null;
  is_system?: boolean;
}): Promise<Role> {
  return prisma.role.upsert({
    where: { name: input.name },
    create: {
      name: input.name,
      description: input.description ?? undefined,
      is_system: input.is_system ?? false,
    },
    update: {
      description: input.description ?? undefined,
    },
  });
}
