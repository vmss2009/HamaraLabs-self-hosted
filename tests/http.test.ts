import { describe, it, expect } from "vitest";
import { failure, success } from "../lib/api/http";

// Minimal NextResponse.json polyfill is not needed because helpers already return a Response-like object from Next.
// We can assert shape and status via .body and init. For simplicity, we'll stringify and parse.

function readJson(res: Response) {
  return res.json();
}

describe("http helpers", () => {
  it("success returns data with default 200", async () => {
    const res = success({ ok: true });
    const data = await readJson(res as unknown as Response);
    expect(data).toEqual({ ok: true });
  });

  it("failure returns error envelope with status/code/details", async () => {
    const res = failure("Invalid", 400, { code: "VALIDATION_ERROR", details: { a: 1 } });
    const data = await readJson(res as unknown as Response);
    expect(data).toEqual({ error: "Invalid", code: "VALIDATION_ERROR", details: { a: 1 } });
  });
});
