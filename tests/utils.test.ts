import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

// Simple unit test for cn utility

describe("cn utility", () => {
  it("merges class names with tailwind merge semantics", () => {
    const result = cn("px-2", "py-2", "px-4");
    expect(result).toBe("py-2 px-4");
  });

  it("handles falsy values gracefully", () => {
    const result = cn("text-sm", undefined, null, false && "hidden");
    expect(result).toBe("text-sm");
  });
});
