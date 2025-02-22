import type { ServerWebSocket } from "bun";
import type { WSMessageBody, WsMessageEvent } from "../types";
import type { WSContext, WSMessageReceive } from "hono/ws";

export async function handleSocketEvents(
  event: MessageEvent<WSMessageReceive>,
  ws: WSContext<ServerWebSocket>
) {
  const body = event.data;
  try {
    const message: WSMessageBody = JSON.parse(body.toString());
    const event = message.event as WsMessageEvent;
    switch (event) {
      case "MESSAGE":
        ws.send(`MESSAGE RECEIVED: ${message.data}`);
        break;
      case "SCREENSHOT":
        ws.send(`SCREENSHOT RECEIVED: ${message.data}`);
        break;
    }
  } catch (error) {
    console.error("Failed to parse message:", error);
    ws.send("Invalid message format");
  }
}
