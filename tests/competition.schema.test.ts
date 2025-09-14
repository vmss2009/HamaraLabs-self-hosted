import { describe, it, expect } from "vitest";
import { competitionSchema } from "../lib/db/competition/type";

// Schema-focused tests (unit): ensure minimal Zod contracts don't regress.

describe("competitionSchema", () => {
  it("accepts valid paid competition with fee", () => {
    const result = competitionSchema.safeParse({
      name: "Comp A",
      description: "desc",
      organised_by: "Org",
      application_start_date: new Date(),
      application_end_date: new Date(),
      competition_start_date: new Date(),
      competition_end_date: new Date(),
      eligibility: ["grade 9"],
      requirements: ["req"],
      reference_links: ["https://example.com"],
      payment: "paid",
      fee: "100",
      comments: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects paid competition without fee", () => {
    const result = competitionSchema.safeParse({
      name: "Comp A",
      description: "desc",
      organised_by: "Org",
      application_start_date: new Date(),
      application_end_date: new Date(),
      competition_start_date: new Date(),
      competition_end_date: new Date(),
      eligibility: ["grade 9"],
      requirements: ["req"],
      reference_links: ["https://example.com"],
      payment: "paid",
      comments: "",
    });
    expect(result.success).toBe(false);
  });
});
