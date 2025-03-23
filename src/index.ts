import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { handleSocketEvents } from "./socket/socket";
import { Agent } from "./agent/agent";
import { BrowserManager } from "./browser";
import { handleBrowserInteractivity } from "./browser-interactivity";
import type { BrowserInput } from "./types";
import { cors } from "hono/cors";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.use(
  "/browser",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let browserManager: BrowserManager;
    let agent: Agent;

    return {
      onOpen: async (_, ws) => {
        browserManager = await BrowserManager.getInstance();
        agent = new Agent({ browserManager, ws });
      },
      onMessage: (event, ws) => {
        handleSocketEvents(event, ws, agent);
      },
      onClose: async () => {
        await browserManager?.closeBrowser();
      },
    };
  })
);

app.get(
  "/browser",
  upgradeWebSocket(async (c) => {
    let browserManager: BrowserManager;
    let screenshotTimer: Timer | null = null;

    return {
      onOpen: async (_, ws) => {
        browserManager = await BrowserManager.getInstance();
      },

      onMessage: async (event, ws) => {
        const browserInput = JSON.parse(event.data as string) as BrowserInput;

        if (browserInput.shouldStream === true) {
          screenshotTimer = setInterval(async () => {
            const screenshot = await browserManager.takeScreenshot();
            const base64Screenshot = screenshot.toString("base64");
            ws.send(
              JSON.stringify({
                data: `data:image/png;base64,${base64Screenshot}`,
              })
            );
          }, 100);
        }

        if (browserInput.shouldStream === false) {
          screenshotTimer && clearInterval(screenshotTimer);
          screenshotTimer = null;
        }

        handleBrowserInteractivity({
          browserInput,
          browserManager,
          ws,
        });
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
