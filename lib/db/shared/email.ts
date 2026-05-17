import { prisma } from "@/lib/db/prisma";

export function normalizeEmail(email: string | null | undefined): string {
  return email ? email.trim().toLowerCase() : "";
}

export async function ensureEmailsAvailable(
  emails: Array<string | null | undefined>,
  allowedExisting: Iterable<string> = []
): Promise<void> {
  const normalized = Array.from(
    new Set(
      emails
        .map(normalizeEmail)
        .filter((email): email is string => Boolean(email))
    )
  );

  if (normalized.length === 0) {
    return;
  }

  const allowedSet = new Set(
    Array.from(allowedExisting ?? [])
      .map(normalizeEmail)
      .filter(Boolean)
  );

  const conflicts = await prisma.user.findMany({
    where: {
      email: {
        in: normalized,
        mode: "insensitive",
      },
    },
    select: { email: true },
  });

  const conflict = conflicts.find(
    (user) => !allowedSet.has(normalizeEmail(user.email))
  );

  if (conflict) {
    throw new Error(`Account already exists for email ${conflict.email}`);
  }
}
