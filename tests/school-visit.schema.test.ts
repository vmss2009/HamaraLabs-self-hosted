import { describe, it, expect } from "vitest";
import { schoolVisitSchema } from "../lib/db/school-visits/type";

describe("schoolVisitSchema", () => {
  it("accepts a valid visit with optional poc", () => {
    const result = schoolVisitSchema.safeParse({
      school_id: "550e8400-e29b-41d4-a716-446655440000",
      visit_date: new Date().toISOString(),
      poc_id: null,
      other_poc: "Other",
      school_performance: "Good performing",
      details: { summary: "Visit" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date", () => {
    const result = schoolVisitSchema.safeParse({
      school_id: "550e8400-e29b-41d4-a716-446655440000",
      visit_date: "not-a-date",
      school_performance: "Good performing",
      details: { summary: "Visit" },
    });
    expect(result.success).toBe(false);
  });
});
