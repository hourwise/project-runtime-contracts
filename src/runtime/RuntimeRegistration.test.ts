import { describe, expect, it } from "vitest";
import { RuntimeReadinessStatus } from "./RuntimeReadiness";
import { RuntimeRegistrationSchema, RuntimeTransport } from "./RuntimeRegistration";

describe("RuntimeRegistration", () => {
  it("represents a standalone runtime degraded only by an optional integration", () => {
    const registration = RuntimeRegistrationSchema.parse({
      identity: {
        runtime: "fixture-runtime",
        version: "2.3.0",
        packageVersion: "2.3.0",
        buildVersion: "fixture-build",
        protocolVersion: "1.4.0",
        minimumProtocolVersion: "1.0.0",
        supportedProtocolRange: { minimum: "1.0.0", maximum: "1.4.0" },
        instanceId: "fixture-instance-1",
        standalone: true,
      },
      readiness: {
        ready: true,
        status: RuntimeReadinessStatus.Degraded,
        unavailableIntegrations: ["mnemosyne"],
        dependencies: [
          { dependencyId: "mnemosyne", status: RuntimeReadinessStatus.NotReady, required: false },
        ],
      },
      endpoints: [{ id: "mcp-stdio", transport: RuntimeTransport.Stdio, command: "fixture" }],
      optionalIntegrations: ["mnemosyne"],
      standalone: true,
    });

    expect(registration.readiness?.ready).toBe(true);
    expect(registration.identity.instanceId).toBe("fixture-instance-1");
  });

  it("rejects an internally inconsistent identity protocol range", () => {
    expect(() => RuntimeRegistrationSchema.parse({
      identity: {
        runtime: "fixture-runtime",
        version: "2.3.0",
        protocolVersion: "1.4.0",
        minimumProtocolVersion: "1.2.0",
        supportedProtocolRange: { minimum: "1.0.0", maximum: "1.4.0" },
      },
    })).toThrow();
  });
});
