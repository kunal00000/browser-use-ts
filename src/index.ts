import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { handleSocketEvents } from "./socket/socket";
import { createPage, spawnBrowser } from "./browser";
import type { Browser, Page } from "playwright";
import { Agent } from "./agent/agent";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let browser: Browser;
    let page: Page;
    let agent: Agent;

    return {
      onOpen: async (_, ws) => {
        browser = await spawnBrowser();
        page = await createPage("https://www.google.com", browser);
        agent = new Agent(page, ws);
      },
      onMessage(event, ws) {
        handleSocketEvents(event, ws, page, agent);
      },
      onClose: async () => {
        await browser?.close();
      },
    };
  })
);

export default {
  port: 8080,
  fetch: app.fetch,
  websocket,
};
