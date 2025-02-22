import type { agentResponseSchema } from "./agent/schema";
import { z } from "zod";

export type WSMessageBody = {
  event: string;
  data: Record<string, any>;
};

export type WsMessageEvent = "MESSAGE" | "SCREENSHOT";

export type AgentResponse = z.infer<typeof agentResponseSchema>;
