import { describe, it, expect } from "vitest";
import { mentorSchema } from "../lib/db/mentor/type";

describe("mentorSchema", () => {
  it("accepts valid mentor", () => {
    const result = mentorSchema.safeParse({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      user_meta_data: { phone_number: "1234567890" },
      school_ids: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing school_ids", () => {
    const result = mentorSchema.safeParse({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      user_meta_data: { phone_number: "1234567890" },
      school_ids: [],
    });
    expect(result.success).toBe(false);
  });
});
