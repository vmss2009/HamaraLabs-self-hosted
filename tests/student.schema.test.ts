import { describe, it, expect } from "vitest";
import { studentSchema } from "../lib/db/student/type";

describe("studentSchema", () => {
  it("accepts valid student payload", () => {
    const result = studentSchema.safeParse({
      first_name: "John",
      last_name: "Doe",
      aspiration: "Engineer",
      gender: "Male",
      email: "john@example.com",
      class: "10",
      section: "A",
      comments: "",
      schoolId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gender).toBe("male");
    }
  });

  it("rejects invalid email", () => {
    const result = studentSchema.safeParse({
      first_name: "John",
      last_name: "Doe",
      aspiration: "Engineer",
      gender: "male",
      email: "bad-email",
      class: "10",
      section: "A",
      comments: "",
      schoolId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });
});
