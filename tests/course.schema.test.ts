import { describe, it, expect } from "vitest";
import { courseSchema } from "../lib/db/course/type";

describe("courseSchema", () => {
  it("accepts valid course payload", () => {
    const result = courseSchema.safeParse({
      name: "Course A",
      description: "desc",
      organised_by: "Org",
      application_start_date: new Date(),
      application_end_date: new Date(),
      course_start_date: new Date(),
      course_end_date: new Date(),
      eligibility_from: "grade 9",
      eligibility_to: "grade 12",
      reference_link: "https://example.com",
      requirements: ["req"],
      course_tags: ["tag1"],
    });
    expect(result.success).toBe(true);
  });

  it("coerces empty optional arrays to []", () => {
    const result = courseSchema.safeParse({
      name: "Course A",
      description: "desc",
      organised_by: "Org",
      application_start_date: new Date(),
      application_end_date: new Date(),
      course_start_date: new Date(),
      course_end_date: new Date(),
      eligibility_from: "grade 9",
      eligibility_to: "grade 12",
      reference_link: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requirements).toEqual([]);
      expect(result.data.course_tags).toEqual([]);
    }
  });
});
