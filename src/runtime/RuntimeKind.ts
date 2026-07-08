import { z } from "zod";

export enum RuntimeKind {
  Ananke = "ananke",
  Mnemosyne = "mnemosyne",
}

export const RuntimeKindSchema = z.nativeEnum(RuntimeKind);

