import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { Agent } from "../agent/agent";
import type { WebSocketMessage } from "../types";

export async function handleSocketEvents({
  message,
  ws,
  agent,
}: {
  message: WebSocketMessage;
  ws: WSContext<ServerWebSocket>;
  agent: Agent;
}): Promise<void> {
  try {
    if (message.type === "USER_INPUT") {
      await agent.callAI(message.content);
    }
  } catch (error) {
    console.error("Socket event handler error:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        content: `Error processing message: ${error}`,
      })
    );
  }
}
