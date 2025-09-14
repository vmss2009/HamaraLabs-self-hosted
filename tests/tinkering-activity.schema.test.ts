import { describe, it, expect } from "vitest";
import { tinkeringActivitySchema } from "../lib/db/tinkering-activity/type";

describe("tinkeringActivitySchema", () => {
  it("accepts a valid activity", () => {
    const result = tinkeringActivitySchema.safeParse({
      name: "Activity A",
      subtopicId: 1,
      introduction: "Intro",
      goals: ["g1"],
      materials: ["m1"],
      instructions: ["i1"],
      tips: [],
      observations: [],
      extensions: [],
      resources: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid subtopicId", () => {
    const result = tinkeringActivitySchema.safeParse({
      name: "Activity A",
      subtopicId: 0,
      introduction: "Intro",
    });
    expect(result.success).toBe(false);
  });
});
