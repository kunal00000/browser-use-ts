import type { agentResponseSchema } from "./agent/schema";
import { z } from "zod";

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export type BrowserInput = {
  type: "click" | "type" | "scroll" | "stream";
  x?: number;
  y?: number;
  value?: string;
  deltaY?: number;
  shouldStream?: boolean;
};
