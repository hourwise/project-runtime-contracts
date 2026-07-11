import { describe, expect, it } from "vitest";
import {
  ExecutionEnvironmentSchema,
  IsolationLevel,
  IsolationLevelSchema,
  ResourceLimitsSchema,
} from "./ExecutionEnvironment";

describe("IsolationLevelSchema", () => {
  it("accepts every defined isolation level", () => {
    for (const level of Object.values(IsolationLevel)) {
      expect(IsolationLevelSchema.parse(level)).toBe(level);
    }
  });

  it("rejects an unsupported isolation level", () => {
    expect(() => IsolationLevelSchema.parse("virtual-machine")).toThrow();
  });
});

describe("ResourceLimitsSchema", () => {
  it("accepts portable CPU expressions and positive numeric limits", () => {
    expect(
      ResourceLimitsSchema.parse({ cpu: "500m", memoryMb: 512, timeoutMs: 30_000 }),
    ).toEqual({ cpu: "500m", memoryMb: 512, timeoutMs: 30_000 });
  });

  it("rejects empty or non-positive resource limits", () => {
    expect(() => ResourceLimitsSchema.parse({ cpu: "" })).toThrow();
    expect(() => ResourceLimitsSchema.parse({ memoryMb: 0 })).toThrow();
    expect(() => ResourceLimitsSchema.parse({ timeoutMs: -1 })).toThrow();
    expect(() => ResourceLimitsSchema.parse({ memoryMb: 1.5 })).toThrow();
  });
});

describe("ExecutionEnvironmentSchema", () => {
  it("parses a complete execution-environment declaration", () => {
    const environment = {
      isolationLevel: IsolationLevel.Container,
      provider: "docker",
      operatingSystem: "linux",
      architecture: "x64",
      networkPolicyId: "network-restricted",
      filesystemScope: ["workspace/**", "!workspace/.env"],
      resourceLimits: { cpu: "1", memoryMb: 1024, timeoutMs: 60_000 },
    };

    expect(ExecutionEnvironmentSchema.parse(environment)).toEqual(environment);
  });

  it("parses the required isolation level without implicit defaults", () => {
    expect(ExecutionEnvironmentSchema.parse({ isolationLevel: IsolationLevel.Process })).toEqual({
      isolationLevel: IsolationLevel.Process,
    });
  });

  it("accepts opaque filesystem selectors but rejects empty selectors", () => {
    expect(
      ExecutionEnvironmentSchema.parse({
        isolationLevel: IsolationLevel.RemoteSandbox,
        filesystemScope: ["runtime://workspace/default"],
      }).filesystemScope,
    ).toEqual(["runtime://workspace/default"]);

    expect(() =>
      ExecutionEnvironmentSchema.parse({
        isolationLevel: IsolationLevel.Host,
        filesystemScope: [""],
      }),
    ).toThrow();
  });
});

