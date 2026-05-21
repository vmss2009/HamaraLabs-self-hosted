import { AbilityBuilder, fieldPatternMatcher, mongoQueryMatcher } from "@casl/ability";
import { AppAbility, type AppAction, type AppSubject, type SerializedRule } from "./types";
import { getRulesForUser } from "@/lib/db/authz";

function interpolate(
  value: unknown,
  ctx: Record<string, unknown>,
): unknown {
  if (typeof value === "string") {
    const match = value.match(/^\$\{([^}]+)\}$/);
    if (!match) return value;
    const path = match[1].split(".");
    let cursor: unknown = ctx;
    for (const key of path) {
      if (cursor == null || typeof cursor !== "object") return value;
      cursor = (cursor as Record<string, unknown>)[key];
    }
    return cursor;
  }
  if (Array.isArray(value)) return value.map((v) => interpolate(v, ctx));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = interpolate(v, ctx);
    return out;
  }
  return value;
}

export async function buildAbilityForUser(userId: string): Promise<{
  ability: InstanceType<typeof AppAbility>;
  rules: SerializedRule[];
}> {
  const { user, permissions } = await getRulesForUser(userId);
  if (!user) {
    const empty = new AppAbility([]);
    return { ability: empty, rules: [] };
  }

  const isAdmin =
    user.user_meta_data &&
    (user.user_meta_data as { isAdmin?: unknown }).isAdmin === true;
  if (isAdmin) {
    const rules: SerializedRule[] = [{ action: "manage", subject: "all" }];
    const ability = new AppAbility(rules as never, {
      fieldMatcher: fieldPatternMatcher,
      conditionsMatcher: mongoQueryMatcher as never,
      detectSubjectType: (subject) => {
        if (typeof subject === "string") return subject;
        if (subject && typeof subject === "object" && "__type" in subject) {
          return (subject as { __type: AppSubject }).__type;
        }
        return (
          (subject as { constructor?: { name?: string } })?.constructor?.name ??
          "all"
        );
      },
    });
    return { ability, rules };
  }

  const ctx = { user };
  const builder = new AbilityBuilder(AppAbility);
  const rules: SerializedRule[] = [];

  for (const p of permissions) {
    const base = p.conditions as Record<string, unknown> | null;
    const interpolated = base
      ? (interpolate(base, ctx) as Record<string, unknown>)
      : undefined;

    const action = p.action as AppAction;
    const subject = p.subject as AppSubject;
    const fields = p.field ? [p.field] : undefined;

    const rule: SerializedRule = {
      action,
      subject,
      ...(fields ? { fields } : {}),
      ...(interpolated ? { conditions: interpolated } : {}),
      ...(p.inverted ? { inverted: true } : {}),
      ...(p.reason ? { reason: p.reason } : {}),
    };
    rules.push(rule);

    if (p.inverted) {
      builder.cannot(action, subject, fields, interpolated).because(
        p.reason ?? "denied by policy",
      );
    } else {
      if (fields) {
        builder.can(action, subject, fields, interpolated);
      } else {
        builder.can(action, subject, interpolated);
      }
    }
  }

  const ability = builder.build({
    fieldMatcher: fieldPatternMatcher,
    conditionsMatcher: mongoQueryMatcher as never,
    detectSubjectType: (subject) => {
      if (typeof subject === "string") return subject;
      if (subject && typeof subject === "object" && "__type" in subject) {
        return (subject as { __type: AppSubject }).__type;
      }
      return (subject as { constructor?: { name?: string } })?.constructor?.name ?? "all";
    },
  });

  return { ability, rules };
}

export function abilityFromRules(rules: SerializedRule[]): InstanceType<typeof AppAbility> {
  return new AppAbility(rules as never, {
    fieldMatcher: fieldPatternMatcher,
    conditionsMatcher: mongoQueryMatcher as never,
    detectSubjectType: (subject) => {
      if (typeof subject === "string") return subject;
      if (subject && typeof subject === "object" && "__type" in subject) {
        return (subject as { __type: string }).__type;
      }
      return (subject as { constructor?: { name?: string } })?.constructor?.name ?? "all";
    },
  });
}
