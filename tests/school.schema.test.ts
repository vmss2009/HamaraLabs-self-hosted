import { describe, it, expect } from "vitest";
import { schoolSchema } from "../lib/db/school/type";

describe("schoolSchema", () => {
  it("accepts a valid school payload", () => {
    const result = schoolSchema.safeParse({
      name: "ABC School",
      is_ATL: true,
      ATL_establishment_year: 2018,
      address: {
        address_line1: "123 Main St",
        pincode: "560001",
        cityId: 1,
      },
      in_charge: {
        email: "incharge@example.com",
        first_name: "In",
        last_name: "Charge",
        user_meta_data: { phone_number: "1234567890" },
      },
      correspondent: {
        email: "corr@example.com",
        first_name: "Co",
        last_name: "Rr",
        user_meta_data: {},
      },
      principal: {
        email: "principal@example.com",
        first_name: "Pri",
        last_name: "Ncipal",
        user_meta_data: {},
      },
      syllabus: ["CBSE"],
      website_url: "https://example.com",
      paid_subscription: false,
      social_links: ["https://twitter.com/abc"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid website_url when not empty string", () => {
    const result = schoolSchema.safeParse({
      name: "ABC School",
      is_ATL: false,
      address: {
        address_line1: "123 Main St",
        pincode: "560001",
        cityId: 1,
      },
      in_charge: {
        email: "incharge@example.com",
        first_name: "In",
        last_name: "Charge",
        user_meta_data: {},
      },
      correspondent: {
        email: "corr@example.com",
        first_name: "Co",
        last_name: "Rr",
        user_meta_data: {},
      },
      principal: {
        email: "principal@example.com",
        first_name: "Pri",
        last_name: "Ncipal",
        user_meta_data: {},
      },
      syllabus: [],
      website_url: "not-a-url",
      paid_subscription: true,
    });
    expect(result.success).toBe(false);
  });

  it("allows empty or omitted optional arrays and fields", () => {
    const result = schoolSchema.safeParse({
      name: "No Links School",
      is_ATL: false,
      address: {
        address_line1: "456 Side St",
        pincode: "110001",
        cityId: 2,
      },
      in_charge: {
        email: "a@b.com",
        first_name: "A",
        last_name: "B",
        user_meta_data: {},
      },
      correspondent: {
        email: "c@d.com",
        first_name: "C",
        last_name: "D",
        user_meta_data: {},
      },
      principal: {
        email: "e@f.com",
        first_name: "E",
        last_name: "F",
        user_meta_data: {},
      },
      syllabus: [],
      paid_subscription: false,
    });
    expect(result.success).toBe(true);
  });
});