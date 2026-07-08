import { RuntimeIdentitySchema } from "../src/identity/RuntimeIdentity";

const example = {
  runtime: "ananke",
  version: "0.1.0",
  protocolVersion: "1.0.0",
};

const parsed = RuntimeIdentitySchema.parse(example);
console.log("Parsed runtime identity:", parsed);

