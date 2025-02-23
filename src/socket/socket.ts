import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { Agent } from "../agent/agent";
import type { Page } from "playwright";

export async function handleSocketEvents(
  event: MessageEvent,
  ws: WSContext<ServerWebSocket>,
  page: Page,
  agent: Agent
): Promise<void> {
  try {
    const message = JSON.parse(event.data as string);

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
