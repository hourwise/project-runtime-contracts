import {
  CapabilityCategory,
  CapabilityExposure,
  ProtocolVersion,
  isCompatible as isProtocolVersionCompatible,
  RuntimeCompositionSchema,
  RuntimeIdentity,
  RuntimeIdentitySchema,
  RuntimeProfileMode,
  RuntimeProfileSchema,
  RuntimeRegistrationSchema,
  RuntimeTransport,
  RUNTIME_NAMES,
} from "../index";

console.log("=== Protocol Version Info ===");
console.log(`Current version: ${ProtocolVersion.version}`);
console.log(`Minimum supported: ${ProtocolVersion.minimumSupported}`);

// Demonstrate protocol compatibility check.
function isCompatible(remoteVersion: string): boolean {
  return isProtocolVersionCompatible(
    ProtocolVersion.version,
    ProtocolVersion.minimumSupported,
    remoteVersion,
  );
}

console.log(`\nRemote says v1.0.0 compatible? ${isCompatible("1.0.0")}`);
console.log(`Remote says v0.9.9 compatible? ${isCompatible("0.9.9")}`);
console.log(`Remote says v2.0.0 compatible? ${isCompatible("2.0.0")}`);

console.log("\n=== Runtime Names ===");
const anankeIdentity: RuntimeIdentity = {
  runtime: RUNTIME_NAMES.ANANKE,
  version: "0.1.0",
  protocolVersion: ProtocolVersion.version,
  minimumProtocolVersion: ProtocolVersion.minimumSupported,
  capabilities: [
    {
      id: "approval",
      name: "Approval",
      version: "0.1.0",
      category: CapabilityCategory.Approval,
      exposure: CapabilityExposure.Discoverable,
      requiresApproval: false,
    },
    {
      id: "policy",
      name: "Policy",
      version: "0.1.0",
      category: CapabilityCategory.Policy,
      exposure: CapabilityExposure.Discoverable,
    },
  ],
};

const mnemosyneIdentity: RuntimeIdentity = {
  runtime: RUNTIME_NAMES.MNEMOSYNE,
  version: "0.1.0",
  protocolVersion: ProtocolVersion.version,
  minimumProtocolVersion: ProtocolVersion.minimumSupported,
  capabilities: [
    {
      id: "memory",
      name: "Memory",
      version: "0.1.0",
      category: CapabilityCategory.Memory,
      exposure: CapabilityExposure.Discoverable,
    },
    {
      id: "citation",
      name: "Citation",
      version: "0.1.0",
      category: CapabilityCategory.Citation,
      exposure: CapabilityExposure.Discoverable,
    },
  ],
};

console.log("Ananke identity:", RuntimeIdentitySchema.parse(anankeIdentity));
console.log("Mnemosyne identity:", RuntimeIdentitySchema.parse(mnemosyneIdentity));

console.log("\n=== Runtime Registration ===");
const anankeRegistration = RuntimeRegistrationSchema.parse({
  identity: anankeIdentity,
  endpoints: [
    {
      transport: RuntimeTransport.Http,
      url: "http://localhost:3000",
    },
  ],
  registeredAt: new Date(0).toISOString(),
});
console.log("Ananke registration:", anankeRegistration);

console.log("\n=== Horae-Oriented Profile And Composition ===");
const profile = RuntimeProfileSchema.parse({
  id: "personal-development",
  name: "Personal Development",
  mode: RuntimeProfileMode.PersonalDevelopment,
  requiredCapabilities: ["approval", "policy", "memory"],
  exposedCapabilities: ["approval", "policy", "memory", "citation"],
  hiddenCapabilities: ["deployment"],
  runtimeNames: [RUNTIME_NAMES.ANANKE, RUNTIME_NAMES.MNEMOSYNE],
});

const composition = RuntimeCompositionSchema.parse({
  id: "sample-composition",
  profileId: profile.id,
  protocolVersion: ProtocolVersion.version,
  bindings: [
    {
      role: "execution_governor",
      runtime: RUNTIME_NAMES.ANANKE,
      capabilityIds: ["approval", "policy"],
      required: true,
    },
    {
      role: "memory",
      runtime: RUNTIME_NAMES.MNEMOSYNE,
      capabilityIds: ["memory", "citation"],
      required: true,
    },
  ],
  exposedCapabilityIds: profile.exposedCapabilities,
  hiddenCapabilityIds: profile.hiddenCapabilities,
});

console.log("Profile:", profile);
console.log("Composition:", composition);

console.log("\n=== Protocol Negotiation ===");
const moiraRequestsAnanke = {
  runtime: RUNTIME_NAMES.MOIRA,
  requestedProtocol: "1.0.0",
};

console.log(`Moira requests protocol ${moiraRequestsAnanke.requestedProtocol}`);
console.log(`Ananke supports ${ProtocolVersion.minimumSupported} to ${ProtocolVersion.version}`);
console.log(
  `Negotiation result: ${isCompatible(moiraRequestsAnanke.requestedProtocol) ? "Compatible" : "Incompatible"}`
);

console.log("\nAll tests passed!");
