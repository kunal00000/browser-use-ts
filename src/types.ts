import type { agentResponseSchema } from "./agent/schema";
import { z } from "zod";

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export type WebSocketMessage = {
  type: "USER_INPUT" | "REQUEST_INPUT" | "AI_RESPONSE" | "ERROR" | "SCREENSHOT";
  content: string;
  requiresInput?: boolean;
};

export type BrowserInputData = {
  type: "click" | "type" | "scroll";
  x?: number;
  y?: number;
  value?: string;
  deltaY?: number;
};

export type MessageType = {
  type: "TEXT" | "BROWSER_INPUT";
  data: WebSocketMessage | BrowserInputData;
};
