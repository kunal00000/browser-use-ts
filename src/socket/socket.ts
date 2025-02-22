import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { Agent } from "../agent/agent";
import type { Page } from "playwright";

export async function handleSocketEvents(
  event: MessageEvent,
  ws: WSContext<ServerWebSocket>,
  page: Page
): Promise<void> {
  console.log("Socket event:", event);

  const agent = new Agent(page, ws);

  try {
    const message = JSON.parse(event.data as string);

    if (message.type === "USER_INPUT") {
      await agent.handleUserMessage(message.content);
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
