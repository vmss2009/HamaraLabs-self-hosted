import { describe, it, expect } from "vitest";
import { customisedTinkeringActivitySchema, statusSchema } from "../lib/db/customised-tinkering-activity/type";

describe("customisedTinkeringActivitySchema", () => {
  it("accepts minimal valid payload and defaults arrays", () => {
    const result = customisedTinkeringActivitySchema.safeParse({
      name: "Tailored Activity",
      subtopic_id: 10,
      introduction: "Intro",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.goals).toEqual([]);
      expect(result.data.materials).toEqual([]);
      expect(result.data.instructions).toEqual([]);
      expect(result.data.tips).toEqual([]);
      expect(result.data.observations).toEqual([]);
      expect(result.data.extensions).toEqual([]);
      expect(result.data.resources).toEqual([]);
      expect(result.data.status).toEqual([]);
    }
  });

  it("rejects non-positive subtopic_id", () => {
    const result = customisedTinkeringActivitySchema.safeParse({
      name: "Bad",
      subtopic_id: 0,
      introduction: "Intro",
    });
    expect(result.success).toBe(false);
  });
});

describe("statusSchema", () => {
  it("accepts string array", () => {
    const ok = statusSchema.safeParse({ status: ["assigned", "done"] });
    expect(ok.success).toBe(true);
  });

  it("rejects when status missing", () => {
    const bad = statusSchema.safeParse({} as unknown);
    expect(bad.success).toBe(false);
  });
});