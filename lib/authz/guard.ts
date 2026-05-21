import { auth } from "@/lib/auth/auth";
import { failure } from "@/lib/api/http";
import { buildAbilityForUser } from "./ability";
import type { AppAbility, AppAction, AppSubject } from "./types";

type AnyHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
  extras: { ability: AppAbility; userId: string },
) => Promise<Response> | Response;

export type GuardSpec = {
  action: AppAction;
  subject: AppSubject;
  field?: string;
};

export function withPermission(
  spec: GuardSpec | GuardSpec[],
  handler: AnyHandler,
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return failure("Not authenticated", 401, { code: "UNAUTHENTICATED" });
    }

    const { ability } = await buildAbilityForUser(userId);
    const specs = Array.isArray(spec) ? spec : [spec];
    for (const s of specs) {
      const ok = s.field
        ? ability.can(s.action, s.subject, s.field)
        : ability.can(s.action, s.subject);
      if (!ok) {
        return failure("Forbidden", 403, {
          code: "FORBIDDEN",
          details: { action: s.action, subject: s.subject, field: s.field },
        });
      }
    }

    return handler(request, context, { ability, userId });
  };
}

export async function checkPermission(spec: GuardSpec): Promise<{
  allowed: boolean;
  ability: AppAbility | null;
  userId: string | null;
}> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) return { allowed: false, ability: null, userId: null };
  const { ability } = await buildAbilityForUser(userId);
  const allowed = spec.field
    ? ability.can(spec.action, spec.subject, spec.field)
    : ability.can(spec.action, spec.subject);
  return { allowed, ability, userId };
}
