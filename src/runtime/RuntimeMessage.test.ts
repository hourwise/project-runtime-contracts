import { describe, it, expect } from "vitest";
import { RuntimeMessageSchema } from "../src/runtime/RuntimeMessage";

describe("RuntimeMessage Schema", () => {
  describe("Valid runtime messages", () => {
    it("should parse complete message", () => {
      const message = {
        id: "msg-123",
        type: "query.execute",
        payload: { query: "SELECT * FROM users" },
        sender: "client",
        timestamp: "2024-07-11T14:30:00Z",
        correlationId: "corr-456",
      };
      const parsed = RuntimeMessageSchema.parse(message);
      expect(parsed).toEqual(message);
    });

    it("should parse minimal message", () => {
      const message = {
        type: "command.invoke",
      };
      const parsed = RuntimeMessageSchema.parse(message);
      expect(parsed).toEqual(message);
    });

    it("should accept any payload structure", () => {
      const messages = [
        {
          type: "msg1",
          payload: { nested: { deep: { value: 123 } } },
        },
        {
          type: "msg2",
          payload: [1, 2, 3],
        },
        {
          type: "msg3",
          payload: "string",
        },
        {
          type: "msg4",
          payload: null,
        },
      ];
      messages.forEach((msg) => {
        expect(() => RuntimeMessageSchema.parse(msg)).not.toThrow();
      });
    });

    it("should accept all optional fields individually", () => {
      const baseMsg = { type: "test" };
      expect(() => RuntimeMessageSchema.parse({ ...baseMsg, id: "msg-1" })).not.toThrow();
      expect(() =>
        RuntimeMessageSchema.parse({ ...baseMsg, sender: "runtime-1" })
      ).not.toThrow();
      expect(() =>
        RuntimeMessageSchema.parse({ ...baseMsg, timestamp: "2024-07-11T14:30:00Z" })
      ).not.toThrow();
      expect(() =>
        RuntimeMessageSchema.parse({ ...baseMsg, correlationId: "corr-1" })
      ).not.toThrow();
    });
  });

  describe("Invalid runtime messages", () => {
    it("should reject message without type", () => {
      expect(() =>
        RuntimeMessageSchema.parse({
          id: "msg-123",
          payload: {},
        })
      ).toThrow();
    });

    it("should reject message with empty type", () => {
      expect(() =>
        RuntimeMessageSchema.parse({
          type: "",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow message without id", () => {
      const message = { type: "test" };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });

    it("should allow message without payload", () => {
      const message = { type: "test" };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });

    it("should allow message without sender", () => {
      const message = { type: "test" };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });

    it("should allow message without timestamp", () => {
      const message = { type: "test" };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });

    it("should allow message without correlationId", () => {
      const message = { type: "test" };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });
  });

  describe("Timestamp validation", () => {
    it("should accept valid ISO 8601 timestamp", () => {
      const message = {
        type: "test",
        timestamp: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeMessageSchema.parse(message)).not.toThrow();
    });

    it("should reject invalid timestamp format", () => {
      const message = {
        type: "test",
        timestamp: "2024-07-11",
      };
      expect(() => RuntimeMessageSchema.parse(message)).toThrow();
    });
  });

  describe("Request-response correlation", () => {
    it("should support request with correlationId", () => {
      const request = {
        type: "query.execute",
        payload: { query: "SELECT 1" },
        correlationId: "corr-123",
      };
      expect(() => RuntimeMessageSchema.parse(request)).not.toThrow();
    });

    it("should support response with same correlationId", () => {
      const response = {
        type: "query.result",
        payload: { result: [1] },
        correlationId: "corr-123",
      };
      expect(() => RuntimeMessageSchema.parse(response)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const message = {
        id: "msg-123",
        type: "query.execute",
        payload: { query: "SELECT *", params: [1, 2, 3] },
        sender: "client",
        timestamp: "2024-07-11T14:30:00Z",
        correlationId: "corr-456",
      };
      const json = JSON.stringify(message);
      const parsed = RuntimeMessageSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(message);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const message = {
        type: "test",
        unknownField: "ignored",
      };
      const parsed = RuntimeMessageSchema.parse(message);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

