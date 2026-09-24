import { describe, expect, it } from "vitest";
import { personalFromEmployee } from "../employee-form";
import type { EmployeeRecord } from "../types";

const base = {
  firstName: "Jane",
  lastName: "Smith",
  dateOfBirth: "1990-01-01",
  gender: "female",
  profilePhoto: "",
} as EmployeeRecord;

describe("personalFromEmployee", () => {
  it("maps personal fields", () => {
    expect(personalFromEmployee(base)).toEqual({
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "1990-01-01",
      gender: "female",
      profilePhoto: "",
    });
  });

  it("uses empty string for missing values", () => {
    expect(
      personalFromEmployee({
        ...base,
        firstName: undefined as unknown as string,
      }).firstName,
    ).toBe("");
  });
});
