import { describe, it, expect } from "vitest";
import { RuntimeSessionSchema } from "./RuntimeSession";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

describe("RuntimeSession Schema", () => {
  describe("Valid runtime sessions", () => {
    it("should parse complete session with all fields", () => {
      const session = {
        id: "sess-123",
        profileId: "prof-prod",
        project: {
          id: "proj-001",
          name: "My Project",
          rootPath: "/home/user/project",
        },
        agent: {
          id: "agent-1",
          name: "AI Assistant",
          kind: "agent",
        },
        task: {
          id: "task-456",
          summary: "Answer user query",
          riskClass: "low",
          requiredCapabilities: ["query", "execute"],
        },
        runtimeIds: ["horae", "ananke", "mnemosyne"],
        startedAt: "2024-07-11T14:30:00Z",
        expiresAt: "2024-07-11T15:30:00Z",
        metadata: { labels: { environment: "production" } },
      };
      const parsed = RuntimeSessionSchema.parse(session);
      expect(parsed).toEqual(session);
    });

    it("should parse minimal session", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      const parsed = RuntimeSessionSchema.parse(session);
      expect(parsed).toEqual(session);
    });
  });

  describe("Invalid runtime sessions", () => {
    it("should reject session without id", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          startedAt: "2024-07-11T14:30:00Z",
        })
      ).toThrow();
    });

    it("should reject session with empty id", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          id: "",
          startedAt: "2024-07-11T14:30:00Z",
        })
      ).toThrow();
    });

    it("should reject session without startedAt", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          id: "sess-001",
        })
      ).toThrow();
    });

    it("should reject session with invalid startedAt timestamp", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          id: "sess-001",
          startedAt: "2024-07-11",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow session without profileId", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should allow session without project", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should allow session without agent", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should allow session without runtimeIds", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });
  });

  describe("Timestamp validation", () => {
    it("should accept valid ISO 8601 startedAt", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should accept valid ISO 8601 expiresAt", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
        expiresAt: "2024-07-11T15:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should reject invalid expiresAt format", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          id: "sess-001",
          startedAt: "2024-07-11T14:30:00Z",
          expiresAt: "not-a-timestamp",
        })
      ).toThrow();
    });
  });

  describe("Project context", () => {
    it("should allow session without project context", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should validate project identity when included", () => {
      const session = {
        id: "sess-001",
        project: {
          id: "proj-1",
          name: "Test",
          rootPath: "/path",
        },
        startedAt: "2024-07-11T14:30:00Z",
      };
      expect(() => RuntimeSessionSchema.parse(session)).not.toThrow();
    });

    it("should reject invalid project (missing required fields)", () => {
      expect(() =>
        RuntimeSessionSchema.parse({
          id: "sess-001",
          project: { id: "proj-1" },
          startedAt: "2024-07-11T14:30:00Z",
        })
      ).toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const session = {
        id: "sess-123",
        profileId: "prof-prod",
        runtimeIds: ["horae", "ananke"],
        startedAt: "2024-07-11T14:30:00Z",
        expiresAt: "2024-07-11T15:30:00Z",
      };
      const json = JSON.stringify(session);
      const parsed = RuntimeSessionSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(session);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const session = {
        id: "sess-001",
        startedAt: "2024-07-11T14:30:00Z",
        unknownField: "ignored",
      };
      const parsed = RuntimeSessionSchema.parse(session);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

