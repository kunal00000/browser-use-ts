import type { ServerWebSocket } from "bun";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import type { Browser, BrowserContext, Page } from "playwright";
import { Agent } from "./agent/agent";
import { handleBrowserInteractivity, spawnBrowser } from "./browser";
import { handleSocketEvents } from "./socket/socket";
import type { BrowserInputData, MessageType, WebSocketMessage } from "./types";
dotenv.config();

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.use(
  "/ws",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;
    let agent: Agent;
    let screenshotTimer: Timer | null = null;

    return {
      onOpen: async (_, ws) => {
        browser = await spawnBrowser();
        context = await browser.newContext({
          screen: { width: 1280, height: 720 },
        });
        page = await context.newPage();
        await page.goto("https://www.google.com");
        agent = new Agent(page, ws);

        screenshotTimer = setInterval(async () => {
          const screenshot = await page.screenshot();
          const base64Screenshot = screenshot.toString("base64");
          ws.send(
            JSON.stringify({
              type: "SCREENSHOT",
              content: `data:image/png;base64,${base64Screenshot}`,
            })
          );
        }, 100);
      },
      async onMessage(event, ws) {
        const data = JSON.parse(event.data as string) as MessageType;

        if (data.type === "TEXT") {
          const message = data.data as WebSocketMessage;
          await handleSocketEvents({
            message,
            agent,
            ws,
          });
          return;
        }

        if (data.type == "BROWSER_INPUT") {
          const browserInputData = data.data as BrowserInputData;

          await handleBrowserInteractivity({
            browserInputData,
            page,
            ws,
          });
        }
      },
      onClose: async () => {
        if (screenshotTimer) {
          clearInterval(screenshotTimer);
          screenshotTimer = null;
        }
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
