import { z } from "zod";

export enum RuntimeKind {
  Ananke = "ananke",
  Mnemosyne = "mnemosyne",
  Horae = "horae",
  Gateway = "gateway",
  ToolRuntime = "tool-runtime",
  Other = "other",
}

export const RuntimeKindSchema = z.nativeEnum(RuntimeKind);

