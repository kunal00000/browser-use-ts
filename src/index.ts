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
        await browserManager?.createPage("https://www.google.com");
        agent = new Agent({ browserManager, ws });
      },
      onMessage: (event, ws) => {
        console.log("Received message:", event.data);

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
        console.log("Received message:", event.data);

        const browserInput = JSON.parse(event.data as string) as BrowserInput;

        console.log("Browser input:", browserInput);

        if (browserInput.shouldStream === true) {
          console.log("1");

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
          console.log("2");
          screenshotTimer && clearInterval(screenshotTimer);
        }

        if (browserInput.shouldStream === null) {
          console.log("3");

          handleBrowserInteractivity({
            browserInput,
            browserManager,
            ws,
          });
        }
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
