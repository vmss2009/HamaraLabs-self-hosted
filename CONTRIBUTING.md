# Contributing

Thanks for contributing to HamaraLabs Self-Hosted! This guide explains our API conventions, typing strategy, and testing workflow.

## API conventions

- Use the shared HTTP helpers for all route responses:
  - `success<T>(data: T, status = 200)`
  - `failure(error: string, status = 400, opts?: { code?: string; details?: unknown })`
- Prefer Zod for request validation. Parse inputs with `schema.safeParse(body)` and return
  `failure("Invalid request", 400, { code: "VALIDATION_ERROR", details: result.error.flatten() })`
  when validation fails.
- Include a machine-readable `code` where helpful: `INVALID_ID`, `MISSING_PARAM`, `VALIDATION_ERROR`, etc.

## Typing strategy

- Favor Zod-inferred types for request bodies (e.g., `z.infer<typeof schema>`), and Prisma-generated types for DB results where possible.
- Avoid `any`. If you need a temporary escape hatch, prefer `unknown` then safely refine with guards.
- For JSON columns (e.g., Prisma JSON), use `Prisma.InputJsonValue` for inputs.

## UI conventions

- Use the shared `Alert` component. It accepts `type` or `severity` (error | success | info | warning) and `sx` for inline styles.
- For `DetailViewer`, the address section uses `type: "address"`; the underlying component formats the selected row’s `address`.
- Prefer strongly typed props in components; avoid implicit any.

## Testing

- Unit tests use Vitest. Files live under `tests/**/*.test.ts`.
- Run tests:
  - `npm run test` (single run)
  - `npm run test:watch` (watch mode)
  - Add `--coverage` for coverage reporting.
- Keep tests hermetic. For route tests that need validation only, test Zod schemas directly. Avoid DB calls in unit tests.

## Lint and Type-Check

- `npm run lint`: should pass with zero warnings or errors.
- `npm exec tsc -- --noEmit`: should pass with zero errors.

## Submitting changes

- Ensure lint, type-check, and tests all pass.
- Prefer small, focused PRs. Include a short summary of your change and any relevant context.
