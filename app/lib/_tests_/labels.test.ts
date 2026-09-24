import { describe, expect, it } from "vitest";
import { labelVisaStatus, labelWorkType, labelPreferredDays } from "../labels";

describe("labels", () => {
  it("formats visa slug", () => {
    expect(labelVisaStatus("australian-citizen")).toBe("Australian Citizen");
  });
  it("return them dash for empty visa", () => {
    expect(labelVisaStatus(null)).toBe("-");
  });

  it("formats work type", () => {
    expect(labelWorkType("independent-contractor")).toBe(
      "Independent Contractor",
    );
  });

  it("formats preferred days", () => {
    expect(labelPreferredDays(["monday", "tuesday", "friday"])).toBe(
      "Monday, Tuesday, Friday",
    );
  });
});
