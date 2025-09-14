import { describe, it, expect } from "vitest";
import { clusterSchema } from "../lib/db/cluster/type";

describe("clusterSchema", () => {
  it("accepts valid hubs with spokes", () => {
    const result = clusterSchema.safeParse({
      name: "Cluster A",
      hubs: [
        {
          hub_school_id: "550e8400-e29b-41d4-a716-446655440000",
          spoke_school_ids: [
            "550e8400-e29b-41d4-a716-446655440001",
            "550e8400-e29b-41d4-a716-446655440002",
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing spokes", () => {
    const result = clusterSchema.safeParse({
      name: "Cluster A",
      hubs: [
        {
          hub_school_id: "550e8400-e29b-41d4-a716-446655440000",
          spoke_school_ids: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
