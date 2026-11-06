import { createHmac } from "node:crypto";
import { readdirSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, buildAbilityForUser } = vi.hoisted(() => ({
  auth: vi.fn(),
  buildAbilityForUser: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({ auth, handlers: {}, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/authz/ability", () => ({ buildAbilityForUser }));
vi.mock("@/lib/db/prisma", () => {
  // Any query reaching the database means a guard let the request through.
  const db: unknown = new Proxy(() => undefined, {
    get: () => db,
    apply: () => Promise.reject(new Error("database reached")),
  });
  return { default: db, prisma: db };
});

const API_ROOT = path.resolve(__dirname, "../app/api");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// Reachable without a session on purpose. Anything new must be added here deliberately.
const PUBLIC = new Set([
  "GET auth/[...nextauth]",
  "POST auth/[...nextauth]",
  "GET schedules/public/[id]",
  "GET users/[id]",
  "POST bookings",
]);

const ROUTES = (readdirSync(API_ROOT, { recursive: true }) as string[])
  .filter((f) => path.basename(f) === "route.ts")
  .map((f) => path.dirname(f).split(path.sep).join("/"))
  .sort();

const context = () => ({
  params: Promise.resolve(new Proxy({}, { get: () => "some-id", has: () => true })),
});

function requestFor(method: string, route: string, search = "") {
  return new Request(`http://localhost/api/${route}${search}`, {
    method,
    ...(method === "GET" ? {} : { body: "{}", headers: { "content-type": "application/json" } }),
  });
}

type Handler = (req: Request, ctx: unknown) => Promise<Response>;
const load = async (route: string) =>
  (await import(path.join(API_ROOT, route, "route.ts"))) as Partial<Record<string, Handler>>;

function signedSearch(secret: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret).update(`abc:${timestamp}`).digest("hex");
  return `?code=abc&signature=${signature}&timestamp=${timestamp}`;
}

function abilityAllowing(allowed: (action: string, subject: string) => boolean) {
  buildAbilityForUser.mockResolvedValue({ ability: { can: allowed }, rules: [] });
}

beforeEach(() => {
  auth.mockReset();
  buildAbilityForUser.mockReset();
  auth.mockResolvedValue(null);
  abilityAllowing(() => false);
  process.env.SALT_KEY = "test-salt";
});

describe("API routes without a valid session", () => {
  it("finds the API routes", () => {
    expect(ROUTES.length).toBeGreaterThan(70);
  });

  it.each(ROUTES)("%s rejects every non-public handler", async (route) => {
    const mod = await load(route);
    const unguarded: string[] = [];
    for (const method of METHODS) {
      const handler = mod[method];
      if (!handler || PUBLIC.has(`${method} ${route}`)) continue;
      // Query params satisfy handlers that validate them before checking the session.
      const res = await handler(requestFor(method, route, "?userId=some-id&date=2026-01-01"), context());
      if (![401, 403].includes(res.status)) unguarded.push(`${method} returned ${res.status}`);
    }
    expect(unguarded).toEqual([]);
  });
});

describe("permission checks", () => {
  const cases = [
    ["POST", "students"],
    ["PUT", "students/[id]"],
    ["DELETE", "students/[id]"],
    ["POST", "schools"],
    ["DELETE", "schools/[id]"],
    ["POST", "mentors"],
    ["DELETE", "mentors/[id]"],
    ["DELETE", "tinkering-activities/[id]"],
    ["GET", "slots"],
    ["POST", "slots"],
  ] as const;

  it.each(cases)("%s %s is forbidden without the grant", async (method, route) => {
    auth.mockResolvedValue({ user: { id: "student-1" } });
    const handler = (await load(route))[method]!;
    const res = await handler(requestFor(method, route), context());
    expect(res.status).toBe(403);
  });

  it("lets the grant through to the handler", async () => {
    auth.mockResolvedValue({ user: { id: "principal-1" } });
    abilityAllowing((action, subject) => action === "delete" && subject === "Student");
    const handler = (await load("students/[id]")).DELETE!;
    const res = await handler(requestFor("DELETE", "students/[id]"), context());
    expect([401, 403]).not.toContain(res.status);
  });
});

describe("self-or-admin routes", () => {
  it("blocks reading another user's bookings", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    const handler = (await load("bookings")).GET!;
    const res = await handler(requestFor("GET", "bookings", "?userId=user-2&date=2026-01-01"), context());
    expect(res.status).toBe(403);
  });

  it("blocks updating another user", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    const handler = (await load("users/[id]")).PATCH!;
    const res = await handler(requestFor("PATCH", "users/[id]"), context());
    expect(res.status).toBe(403);
  });

  it("allows updating your own user", async () => {
    auth.mockResolvedValue({ user: { id: "some-id" } });
    const handler = (await load("users/[id]")).PATCH!;
    const res = await handler(requestFor("PATCH", "users/[id]"), context());
    expect([401, 403]).not.toContain(res.status);
  });
});

describe("signed requests", () => {
  it("accepts a valid signature", async () => {
    const handler = (await load("students")).GET!;
    const res = await handler(requestFor("GET", "students", signedSearch("test-salt")), context());
    expect([401, 403]).not.toContain(res.status);
  });

  it("rejects a signature made with the wrong key", async () => {
    const handler = (await load("students")).GET!;
    const res = await handler(requestFor("GET", "students", signedSearch("wrong")), context());
    expect(res.status).toBe(401);
  });
});
