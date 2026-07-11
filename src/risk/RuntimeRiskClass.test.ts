import { describe, expect, it } from "vitest";
import { RuntimeRiskClass, RuntimeRiskClassSchema } from "./RuntimeRiskClass";

describe("RuntimeRiskClassSchema", () => {
  it("accepts every defined risk class", () => {
    for (const riskClass of Object.values(RuntimeRiskClass)) {
      expect(RuntimeRiskClassSchema.parse(riskClass)).toBe(riskClass);
    }
  });

  it("rejects an unsupported risk class", () => {
    expect(() => RuntimeRiskClassSchema.parse("HIGH")).toThrow();
  });

  it("round-trips through JSON", () => {
    const value = JSON.parse(JSON.stringify(RuntimeRiskClass.CredentialAccess));
    expect(RuntimeRiskClassSchema.parse(value)).toBe(RuntimeRiskClass.CredentialAccess);
  });
});

