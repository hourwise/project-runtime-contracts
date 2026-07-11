import { describe, it, expect } from "vitest";
import {
  RUNTIME_NAMES,
  RuntimeName,
} from "../src/constants/RuntimeNames";
import {
  DEFAULT_PROTOCOL_VERSION,
  DEFAULT_MINIMUM_SUPPORTED_VERSION,
} from "../src/constants/ProtocolDefaults";
import { ProtocolVersion } from "../src/protocol/ProtocolVersion";

describe("RUNTIME_NAMES Constants", () => {
  describe("Canonical names", () => {
    it("should have well-known runtime names", () => {
      expect(RUNTIME_NAMES.ANANKE).toBe("ananke");
      expect(RUNTIME_NAMES.MNEMOSYNE).toBe("mnemosyne");
      expect(RUNTIME_NAMES.HORAE).toBe("horae");
      expect(RUNTIME_NAMES.MOIRA).toBe("moira");
    });

    it("should have exactly 4 well-known runtimes", () => {
      const names = Object.keys(RUNTIME_NAMES);
      expect(names).toHaveLength(4);
    });

    it("should have unique runtime names", () => {
      const values = Object.values(RUNTIME_NAMES);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });

  describe("RuntimeName type", () => {
    it("should accept all well-known runtime names", () => {
      const validNames: RuntimeName[] = [
        RUNTIME_NAMES.ANANKE,
        RUNTIME_NAMES.MNEMOSYNE,
        RUNTIME_NAMES.HORAE,
        RUNTIME_NAMES.MOIRA,
      ];
      expect(validNames).toHaveLength(4);
    });
  });

  describe("Case sensitivity", () => {
    it("should be lowercase", () => {
      expect(RUNTIME_NAMES.ANANKE).toBe(RUNTIME_NAMES.ANANKE.toLowerCase());
      expect(RUNTIME_NAMES.MNEMOSYNE).toBe(RUNTIME_NAMES.MNEMOSYNE.toLowerCase());
      expect(RUNTIME_NAMES.HORAE).toBe(RUNTIME_NAMES.HORAE.toLowerCase());
      expect(RUNTIME_NAMES.MOIRA).toBe(RUNTIME_NAMES.MOIRA.toLowerCase());
    });
  });
});

describe("Protocol Version Constants", () => {
  describe("DEFAULT_PROTOCOL_VERSION", () => {
    it("should be defined", () => {
      expect(DEFAULT_PROTOCOL_VERSION).toBeDefined();
    });

    it("should be semantic version format", () => {
      expect(DEFAULT_PROTOCOL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should match ProtocolVersion.version", () => {
      expect(DEFAULT_PROTOCOL_VERSION).toBe(ProtocolVersion.version);
    });
  });

  describe("DEFAULT_MINIMUM_SUPPORTED_VERSION", () => {
    it("should be defined", () => {
      expect(DEFAULT_MINIMUM_SUPPORTED_VERSION).toBeDefined();
    });

    it("should be semantic version format", () => {
      expect(DEFAULT_MINIMUM_SUPPORTED_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should match ProtocolVersion.minimumSupported", () => {
      expect(DEFAULT_MINIMUM_SUPPORTED_VERSION).toBe(ProtocolVersion.minimumSupported);
    });
  });

  describe("Version compatibility", () => {
    it("should have minimum version <= current version", () => {
      const [minMajor, minMinor, minPatch] = DEFAULT_MINIMUM_SUPPORTED_VERSION.split(".").map(Number);
      const [curMajor, curMinor, curPatch] = DEFAULT_PROTOCOL_VERSION.split(".").map(Number);

      const minVersion = minMajor * 10000 + minMinor * 100 + minPatch;
      const curVersion = curMajor * 10000 + curMinor * 100 + curPatch;

      expect(minVersion).toBeLessThanOrEqual(curVersion);
    });
  });
});

describe("ProtocolVersion Constant", () => {
  describe("Version structure", () => {
    it("should have version property", () => {
      expect(ProtocolVersion).toHaveProperty("version");
    });

    it("should have minimumSupported property", () => {
      expect(ProtocolVersion).toHaveProperty("minimumSupported");
    });

    it("should have exactly 2 properties", () => {
      expect(Object.keys(ProtocolVersion)).toHaveLength(2);
    });
  });

  describe("Version values", () => {
    it("should have semantic version format for version", () => {
      expect(ProtocolVersion.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should have semantic version format for minimumSupported", () => {
      expect(ProtocolVersion.minimumSupported).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("Version compatibility", () => {
    it("should have minimumSupported <= version", () => {
      const [minMajor, minMinor, minPatch] = ProtocolVersion.minimumSupported
        .split(".")
        .map(Number);
      const [verMajor, verMinor, verPatch] = ProtocolVersion.version
        .split(".")
        .map(Number);

      const minVersion = minMajor * 10000 + minMinor * 100 + minPatch;
      const curVersion = verMajor * 10000 + verMinor * 100 + verPatch;

      expect(minVersion).toBeLessThanOrEqual(curVersion);
    });
  });

  describe("Current version (1.1.0)", () => {
    it("should be at 1.1.0 or later", () => {
      const [major, minor] = ProtocolVersion.version.split(".").map(Number);
      expect(major).toBeGreaterThanOrEqual(1);
      if (major === 1) {
        expect(minor).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

