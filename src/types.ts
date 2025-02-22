import type { agentResponseSchema } from "./agent/schema";
import { z } from "zod";

export type AgentResponse = z.infer<typeof agentResponseSchema>;
