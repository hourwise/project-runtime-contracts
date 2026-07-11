import { describe, it, expect } from "vitest";
import {
  RuntimeEventSchema,
  RuntimeEventType,
  RuntimeEventTypeSchema,
} from "./RuntimeEvent";

describe("RuntimeEventType Schema", () => {
  describe("Valid core event types", () => {
    it("should accept all defined core event types", () => {
      const types = Object.values(RuntimeEventType);
      types.forEach((type) => {
        expect(() => RuntimeEventTypeSchema.parse(type)).not.toThrow();
      });
    });

    it("should accept string literals matching event types", () => {
      expect(() => RuntimeEventTypeSchema.parse("approval.granted")).not.toThrow();
      expect(() => RuntimeEventTypeSchema.parse("runtime.health_changed")).not.toThrow();
      expect(() => RuntimeEventTypeSchema.parse("session.started")).not.toThrow();
    });
  });

  describe("Invalid core event types", () => {
    it("should reject unknown event types", () => {
      expect(() => RuntimeEventTypeSchema.parse("unknown.event")).toThrow();
      expect(() => RuntimeEventTypeSchema.parse("APPROVAL.GRANTED")).toThrow();
    });
  });
});

describe("RuntimeEvent Schema", () => {
  describe("Valid runtime events", () => {
    it("should parse complete core event", () => {
      const event = {
        id: "evt-123",
        type: RuntimeEventType.ApprovalGranted,
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "ananke",
        targetRuntime: "horae",
        sessionId: "sess-456",
        correlationId: "corr-789",
        payload: { approvalId: "appr-001", reason: "auto_approved" },
      };
      const parsed = RuntimeEventSchema.parse(event);
      expect(parsed).toEqual(event);
    });

    it("should parse minimal event", () => {
      const event = {
        id: "evt-001",
        type: "session.started",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "horae",
      };
      const parsed = RuntimeEventSchema.parse(event);
      expect(parsed).toEqual(event);
    });

    it("should accept extension event types", () => {
      const event = {
        id: "evt-ext",
        type: "com.example.custom_event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "custom-runtime",
      };
      expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
    });

    it("should accept all core event types", () => {
      const types = Object.values(RuntimeEventType);
      types.forEach((type) => {
        const event = {
          id: "evt-test",
          type,
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "test-runtime",
        };
        expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
      });
    });
  });

  describe("Invalid runtime events", () => {
    it("should reject event without id", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          type: "test.event",
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event with empty id", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "",
          type: "test.event",
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event without type", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event with empty type", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          type: "",
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event without timestamp", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          type: "test.event",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event with invalid timestamp format", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          type: "test.event",
          timestamp: "2024-07-11",
          sourceRuntime: "runtime",
        })
      ).toThrow();
    });

    it("should reject event without sourceRuntime", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          type: "test.event",
          timestamp: "2024-07-11T14:30:00Z",
        })
      ).toThrow();
    });

    it("should reject event with empty sourceRuntime", () => {
      expect(() =>
        RuntimeEventSchema.parse({
          id: "evt-123",
          type: "test.event",
          timestamp: "2024-07-11T14:30:00Z",
          sourceRuntime: "",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow event without targetRuntime", () => {
      const event = {
        id: "evt-123",
        type: "test.event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime",
      };
      expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
    });

    it("should allow event without sessionId", () => {
      const event = {
        id: "evt-123",
        type: "test.event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime",
      };
      expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
    });

    it("should allow event without correlationId", () => {
      const event = {
        id: "evt-123",
        type: "test.event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime",
      };
      expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
    });

    it("should allow event without payload", () => {
      const event = {
        id: "evt-123",
        type: "test.event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime",
      };
      expect(() => RuntimeEventSchema.parse(event)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const event = {
        id: "evt-123",
        type: RuntimeEventType.SessionStarted,
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "horae",
        sessionId: "sess-456",
        correlationId: "corr-789",
        payload: { projectId: "proj-001" },
      };
      const json = JSON.stringify(event);
      const parsed = RuntimeEventSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(event);
    });
  });

  describe("Correlation patterns", () => {
    it("should support same correlationId for related events", () => {
      const correlationId = "corr-shared";
      const event1 = {
        id: "evt-1",
        type: "operation.started",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime-a",
        correlationId,
      };
      const event2 = {
        id: "evt-2",
        type: "operation.completed",
        timestamp: "2024-07-11T14:30:05Z",
        sourceRuntime: "runtime-b",
        correlationId,
      };
      expect(() => RuntimeEventSchema.parse(event1)).not.toThrow();
      expect(() => RuntimeEventSchema.parse(event2)).not.toThrow();
    });

    it("should support same sessionId for session-scoped events", () => {
      const sessionId = "sess-shared";
      const event1 = {
        id: "evt-1",
        type: "session.started",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "horae",
        sessionId,
      };
      const event2 = {
        id: "evt-2",
        type: "capability.exposed",
        timestamp: "2024-07-11T14:30:05Z",
        sourceRuntime: "mnemosyne",
        sessionId,
      };
      expect(() => RuntimeEventSchema.parse(event1)).not.toThrow();
      expect(() => RuntimeEventSchema.parse(event2)).not.toThrow();
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const event = {
        id: "evt-123",
        type: "test.event",
        timestamp: "2024-07-11T14:30:00Z",
        sourceRuntime: "runtime",
        unknownField: "ignored",
      };
      const parsed = RuntimeEventSchema.parse(event);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

