import { z } from "zod";

/**
 * Classification of runtime roles within the protocol ecosystem.
 *
 * - `ananke`: Policy/authorization decision engine.
 * - `mnemosyne`: Memory/knowledge management runtime.
 * - `horae`: Orchestration/choreography runtime.
 * - `gateway`: Protocol gateway or proxy.
 * - `tool-runtime`: Tool execution or resource provider.
 * - `other`: Unclassified or custom runtime.
 */
export enum RuntimeKind {
  Ananke = "ananke",
  Mnemosyne = "mnemosyne",
  Horae = "horae",
  Gateway = "gateway",
  ToolRuntime = "tool-runtime",
  Other = "other",
}

/** Zod schema for RuntimeKind enum values. */
export const RuntimeKindSchema = z.enum([
  RuntimeKind.Ananke,
  RuntimeKind.Mnemosyne,
  RuntimeKind.Horae,
  RuntimeKind.Gateway,
  RuntimeKind.ToolRuntime,
  RuntimeKind.Other,
]);
