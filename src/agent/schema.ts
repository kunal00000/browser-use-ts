import { z } from "zod";

export const agentResponseSchema = z.object({
  state: z.enum(["INPUT", "PLAN", "ACTION", "OBSERVATION", "OUTPUT"]),
  thought: z.string(),
  action: z
    .object({
      tool: z.string(),
      input: z.record(z.any()),
    })
    .optional(),
  observation: z.any().optional(),
  next_action: z.string().optional(),
  error: z.string().optional(),
  requires_user_input: z.boolean().optional(),
  user_prompt: z.string().optional(),
  final_output: z.string().optional(),
});
