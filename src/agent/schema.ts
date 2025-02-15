import { z } from "zod";

export const agentResponseSchema = z.object({
  state: z.enum(["INPUT", "PLAN", "ACTION", "OBSERVATION", "OUTPUT"]),
  thought: z.string(),
  action: z
    .object({
      tool: z.string(),
      input: z.record(z.any()),
    })
    .nullable()
    .optional(),
  observation: z.any().optional(),
  next_action: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  requires_user_input: z.boolean().optional(),
  user_prompt: z.string().nullable().optional(),
  final_output: z.string().nullable().optional(),
});
