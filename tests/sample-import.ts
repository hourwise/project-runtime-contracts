import {
  CapabilityCategory,
  RuntimeHealthStatus,
  RuntimeIdentitySchema,
  RuntimeRegistrationSchema,
  RuntimeTransport,
} from "../src";

const example = {
  runtime: "ananke",
  version: "0.1.0",
  protocolVersion: "1.0.0",
  capabilities: [
    {
      id: "approval",
      name: "Approval",
      version: "0.1.0",
      category: CapabilityCategory.Approval,
    },
  ],
};

const parsed = RuntimeIdentitySchema.parse(example);
console.log("Parsed runtime identity:", parsed);

const registration = RuntimeRegistrationSchema.parse({
  identity: parsed,
  health: {
    healthy: true,
    status: RuntimeHealthStatus.Healthy,
    uptimeMs: 1000,
    warnings: [],
  },
  endpoints: [
    {
      transport: RuntimeTransport.Http,
      url: "http://localhost:3000",
    },
  ],
});

console.log("Parsed runtime registration:", registration);
