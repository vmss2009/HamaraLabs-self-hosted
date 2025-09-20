// Authentik API client for user CRUD synchronization
// Reads AUTHENTIK_URL and AUTHENTIK_API_TOKEN from environment

export interface AuthentikUser {
  pk?: string | number;
  id?: string | number;
  uuid?: string;
  username: string;
  email: string;
  name?: string;
  is_active?: boolean;
}

function getConfig() {
  const baseUrl = process.env.AUTHENTIK_API_URL;
  const token = process.env.AUTHENTIK_API_TOKEN;
  if (!baseUrl || !token) {
    throw new Error(
      "Missing AUTHENTIK_URL or AUTHENTIK_API_TOKEN env variables. Please set them to enable Authentik sync."
    );
  }
  return { url: baseUrl.replace(/\/$/, ""), token };
}

async function akRequest<T = any>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; json?: T; text?: string; }> {
  const { url, token } = getConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${url}${path}`, { ...init, headers });
  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  if (isJSON) {
    const json = await res.json().catch(() => undefined);
    return { ok: res.ok, status: res.status, json };
  } else {
    const text = await res.text().catch(() => undefined);
    return { ok: res.ok, status: res.status, text };
  }
}

function authUserId(user: AuthentikUser): string | number | undefined {
  return user.id ?? user.pk ?? user.uuid;
}

export async function findAuthentikUserByEmail(email: string): Promise<AuthentikUser | null> {
  try {
    let res = await akRequest<{ results?: AuthentikUser[]; items?: AuthentikUser[] }>(
      `/api/v3/core/users/?email=${encodeURIComponent(email)}`,
      { method: "GET" }
    );
    if (!res.ok || (!res.json?.results && !res.json?.items)) {
      res = await akRequest<{ results?: AuthentikUser[]; items?: AuthentikUser[] }>(
        `/api/v3/core/users/?search=${encodeURIComponent(email)}`,
        { method: "GET" }
      );
    }
    const arr = (res.json?.results ?? res.json?.items) as AuthentikUser[] | undefined;
    if (!arr || arr.length === 0) return null;
    const exact = arr.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
    return exact ?? arr[0] ?? null;
  } catch (e) {
    console.error("Authentik: lookup by email failed:", e);
    return null;
  }
}

export async function createAuthentikUser(input: {
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  password?: string;
  is_active?: boolean;
}): Promise<AuthentikUser | null> {
  try {
    const existing = await findAuthentikUserByEmail(input.email);
    if (existing) return existing;
    const username = input.email;
    const name = input.name ?? [input.first_name, input.last_name].filter(Boolean).join(" ").trim();
    const res = await akRequest<AuthentikUser>(`/api/v3/core/users/`, {
      method: "POST",
      body: JSON.stringify({
        username,
        email: input.email,
        name: name || undefined,
        is_active: input.is_active ?? true,
      }),
    });
    if (!res.ok) {
      console.error("Authentik: create failed:", res.status, res.json ?? res.text);
      return null;
    }
    const user = res.json as AuthentikUser;
    if (input.password && user) {
      const userId = authUserId(user);
      if (userId) {
        const passwordRes = await akRequest(`/api/v3/core/users/${userId}/set_password/`, {
          method: "POST",
          body: JSON.stringify({
            password: input.password,
          }),
        });
        if (!passwordRes.ok) {
          console.error("Authentik: set password failed:", passwordRes.status, passwordRes.json ?? passwordRes.text);
        }
      }
    }
    
    return user ?? null;
  } catch (e) {
    console.error("Authentik: create exception:", e);
    return null;
  }
}

export async function updateAuthentikUserByEmail(oldEmail: string, patch: {
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  is_active?: boolean;
}): Promise<AuthentikUser | null> {
  try {
    const user = await findAuthentikUserByEmail(oldEmail);
    if (!user) {
      return await createAuthentikUser({
        email: patch.email ?? oldEmail,
        first_name: patch.first_name ?? undefined,
        last_name: patch.last_name ?? undefined,
        is_active: patch.is_active,
        password: patch.email ? `${patch.email}@789` : `${oldEmail}@789`,
      });
    }
    const id = authUserId(user);
    if (!id) return null;
    const name = patch.name ?? [patch.first_name, patch.last_name].filter(Boolean).join(" ").trim();
    const res = await akRequest<AuthentikUser>(`/api/v3/core/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        email: patch.email,
        name: name || undefined,
        is_active: patch.is_active,
      }),
    });
    if (!res.ok) {
      console.error("Authentik: update failed:", res.status, res.json ?? res.text);
      return null;
    }
    return (res.json as AuthentikUser) ?? null;
  } catch (e) {
    console.error("Authentik: update exception:", e);
    return null;
  }
}

export async function deleteAuthentikUserByEmail(email: string): Promise<boolean> {
  try {
    const user = await findAuthentikUserByEmail(email);
    if (!user) return true;
    const id = authUserId(user);
    if (!id) return true;
    const res = await akRequest(`/api/v3/core/users/${id}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      console.error("Authentik: delete failed:", res.status, res.json ?? res.text);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Authentik: delete exception:", e);
    return false;
  }
}