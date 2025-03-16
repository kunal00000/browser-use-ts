import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { handleSocketEvents } from "./socket/socket";
import { Agent } from "./agent/agent";
import { BrowserManager } from "./browser";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let browserManager: BrowserManager;
    let agent: Agent;

    return {
      onOpen: async (_, ws) => {
        browserManager = await BrowserManager.getInstance();
        await browserManager?.createPage("https://www.google.com");
        agent = new Agent({ browserManager, ws });
      },
      onMessage(event, ws) {
        console.log("Received message:", event.data);

        handleSocketEvents(event, ws, agent);
      },
      onClose: async () => {
        await browserManager?.closeBrowser();
      },
    };
  })
);

export default {
  port: 8080,
  fetch: app.fetch,
  websocket,
};
