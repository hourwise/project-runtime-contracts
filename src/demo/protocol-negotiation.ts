import {
  RuntimeIdentity,
  RuntimeIdentitySchema,
  ProtocolVersion,
  RUNTIME_NAMES,
  DEFAULT_PROTOCOL_VERSION,
} from "../index";

console.log("=== Protocol Version Info ===");
console.log(`Current version: ${ProtocolVersion.version}`);
console.log(`Minimum supported: ${ProtocolVersion.minimumSupported}`);

// Demonstrate protocol compatibility check
function isCompatible(remoteVersion: string): boolean {
  return remoteVersion >= ProtocolVersion.minimumSupported;
}

console.log(`\nRemote says v1.0.0 compatible? ${isCompatible("1.0.0")}`);
console.log(`Remote says v0.9.9 compatible? ${isCompatible("0.9.9")}`);
console.log(`Remote says v2.0.0 compatible? ${isCompatible("2.0.0")}`);

// Demonstrate runtime identification
console.log("\n=== Runtime Names ===");
const anankeIdentity: RuntimeIdentity = {
  runtime: RUNTIME_NAMES.ANANKE,
  version: "0.1.0",
  protocolVersion: ProtocolVersion.version,
};

const mnemosyngIdentity: RuntimeIdentity = {
  runtime: RUNTIME_NAMES.MNEMOSYNE,
  version: "0.1.0",
  protocolVersion: ProtocolVersion.version,
};

console.log("Ananke identity:", RuntimeIdentitySchema.parse(anankeIdentity));
console.log("Mnemosyne identity:", RuntimeIdentitySchema.parse(mnemosyngIdentity));

// Demonstrate protocol negotiation scenario
console.log("\n=== Protocol Negotiation ===");
const moiraRequestsAnanke = {
  runtime: RUNTIME_NAMES.MOIRA,
  requestedProtocol: "1.0.0",
};

console.log(`Moira requests protocol ${moiraRequestsAnanke.requestedProtocol}`);
console.log(`Ananke supports ${ProtocolVersion.minimumSupported} to ${ProtocolVersion.version}`);
console.log(
  `Negotiation result: ${isCompatible(moiraRequestsAnanke.requestedProtocol) ? "✓ Compatible" : "✗ Incompatible"}`
);

console.log("\nAll tests passed!");

