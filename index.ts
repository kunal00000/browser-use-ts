import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { handleSocketEvents } from "./src/socket/socket";

const app = new Hono();
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen: (_, ws) => {
        ws.send("Connection established");
      },
      onMessage(event, ws) {
        handleSocketEvents(event, ws);
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  })
);

export default {
  port: 8080,
  fetch: app.fetch,
  websocket,
};

// ----------------- 1. Basic Puppeteer -----------------
// import { createPage, spawnBrowser } from "./src/browser";
// import { agent } from "./src/agent";

// const INIT_URL = "https://www.google.com";

// async function main() {
//   const browser = await spawnBrowser();
//   const page = await createPage(INIT_URL, browser);

//   await agent(page);

//   await browser.close();
// }

// main();
