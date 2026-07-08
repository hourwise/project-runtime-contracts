import { z } from "zod";
import { RuntimeErrorSchema, RuntimeError } from "./RuntimeError";

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: RuntimeError;
}

export const createResultSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema ? dataSchema.optional() : z.any().optional(),
    error: RuntimeErrorSchema.optional(),
  });

export type ResultType<T> = Result<T>;

