import { describe, it, expect } from "vitest";
import { Severity, SeveritySchema } from "../results/Severity";
import { AuditEventSchema, AuditEvent } from "./AuditEvent";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

describe("Severity Schema", () => {
  describe("Valid severity values", () => {
    it("should accept all defined severity levels", () => {
      expect(() => SeveritySchema.parse(Severity.Info)).not.toThrow();
      expect(() => SeveritySchema.parse(Severity.Warning)).not.toThrow();
      expect(() => SeveritySchema.parse(Severity.Error)).not.toThrow();
      expect(() => SeveritySchema.parse(Severity.Critical)).not.toThrow();
    });

    it("should accept string literals matching severity values", () => {
      expect(() => SeveritySchema.parse("info")).not.toThrow();
      expect(() => SeveritySchema.parse("warning")).not.toThrow();
      expect(() => SeveritySchema.parse("error")).not.toThrow();
      expect(() => SeveritySchema.parse("critical")).not.toThrow();
    });
  });

  describe("Invalid severity values", () => {
    it("should reject unknown severity values", () => {
      expect(() => SeveritySchema.parse("unknown")).toThrow();
      expect(() => SeveritySchema.parse("INFO")).toThrow();
      expect(() => SeveritySchema.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => SeveritySchema.parse(0)).toThrow();
      expect(() => SeveritySchema.parse(null)).toThrow();
      expect(() => SeveritySchema.parse(undefined)).toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should serialize and deserialize severity values", () => {
      const original = Severity.Critical;
      const json = JSON.stringify(original);
      const parsed = SeveritySchema.parse(JSON.parse(json));
      expect(parsed).toBe(original);
    });
  });
});

describe("ISO8601 Timestamp Schema", () => {
  describe("Valid timestamps", () => {
    it("should accept UTC format with Z", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00Z")).not.toThrow();
    });

    it("should accept UTC format with milliseconds", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00.123Z")).not.toThrow();
    });

    it("should accept positive UTC offset", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00+05:30")).not.toThrow();
    });

    it("should accept negative UTC offset", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00-08:00")).not.toThrow();
    });

    it("should accept RFC 3339 format", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00+00:00")).not.toThrow();
    });
  });

  describe("Invalid timestamps", () => {
    it("should reject non-ISO 8601 formats", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-07-11 14:30:00")).toThrow();
      expect(() => ISO8601TimestampSchema.parse("07/11/2024")).toThrow();
      expect(() => ISO8601TimestampSchema.parse("2024-07-11")).toThrow();
    });

    it("should reject invalid dates", () => {
      expect(() => ISO8601TimestampSchema.parse("2024-13-01T00:00:00Z")).toThrow();
      expect(() => ISO8601TimestampSchema.parse("2024-00-01T00:00:00Z")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => ISO8601TimestampSchema.parse(1234567890)).toThrow();
      expect(() => ISO8601TimestampSchema.parse(new Date())).toThrow();
    });

    it("should reject empty strings", () => {
      expect(() => ISO8601TimestampSchema.parse("")).toThrow();
    });
  });
});

describe("AuditEvent Schema", () => {
  describe("Valid audit events", () => {
    it("should parse complete audit event with details", () => {
      const event: AuditEvent = {
        timestamp: "2024-07-11T14:30:00Z",
        runtime: "ananke",
        event: "permission.granted",
        severity: Severity.Warning,
        details: {
          actor: "user-123",
          resource: "api.write",
          reason: "elevated_privileges",
        },
      };
      const parsed = AuditEventSchema.parse(event);
      expect(parsed).toEqual(event);
    });

    it("should parse audit event without optional details", () => {
      const event: AuditEvent = {
        timestamp: "2024-07-11T14:30:00Z",
        runtime: "mnemosyne",
        event: "data.accessed",
        severity: Severity.Info,
      };
      const parsed = AuditEventSchema.parse(event);
      expect(parsed).toEqual(event);
    });

    it("should accept all severity levels", () => {
      Object.values(Severity).forEach((severity) => {
        const event = {
          timestamp: "2024-07-11T14:30:00Z",
          runtime: "horae",
          event: "test.event",
          severity,
        };
        expect(() => AuditEventSchema.parse(event)).not.toThrow();
      });
    });
  });

  describe("Invalid audit events", () => {
    it("should reject event without timestamp", () => {
      expect(() =>
        AuditEventSchema.parse({
          runtime: "ananke",
          event: "test",
          severity: Severity.Info,
        })
      ).toThrow();
    });

    it("should reject event with invalid timestamp", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11",
          runtime: "ananke",
          event: "test",
          severity: Severity.Info,
        })
      ).toThrow();
    });

    it("should reject event without runtime", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11T14:30:00Z",
          event: "test",
          severity: Severity.Info,
        })
      ).toThrow();
    });

    it("should reject event with empty runtime", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11T14:30:00Z",
          runtime: "",
          event: "test",
          severity: Severity.Info,
        })
      ).toThrow();
    });

    it("should reject event without event type", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11T14:30:00Z",
          runtime: "ananke",
          severity: Severity.Info,
        })
      ).toThrow();
    });

    it("should reject event without severity", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11T14:30:00Z",
          runtime: "ananke",
          event: "test",
        })
      ).toThrow();
    });

    it("should reject event with invalid severity", () => {
      expect(() =>
        AuditEventSchema.parse({
          timestamp: "2024-07-11T14:30:00Z",
          runtime: "ananke",
          event: "test",
          severity: "invalid",
        })
      ).toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const event: AuditEvent = {
        timestamp: "2024-07-11T14:30:00Z",
        runtime: "horae",
        event: "session.started",
        severity: Severity.Info,
        details: { sessionId: "sess-123" },
      };
      const json = JSON.stringify(event);
      const parsed = AuditEventSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(event);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const event = {
        timestamp: "2024-07-11T14:30:00Z",
        runtime: "ananke",
        event: "test",
        severity: Severity.Info,
        unknownField: "ignored",
      };
      const parsed = AuditEventSchema.parse(event);
      expect("unknownField" in parsed).toBe(false);
      expect(parsed.timestamp).toBe(event.timestamp);
    });
  });
});

