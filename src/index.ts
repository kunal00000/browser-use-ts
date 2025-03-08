import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { handleSocketEvents } from "./socket/socket";
import { createPage, spawnBrowser } from "./browser";
import type { Browser, Page } from "playwright";
import { Agent } from "./agent/agent";
import type { WSContext } from "hono/ws";
import { cors } from "hono/cors";

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

app.use(
  "/browser/session",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

const browserSessions: Map<
  string,
  {
    browser: Browser;
    pages: Page[];
    wsClients: Set<WSContext<ServerWebSocket>>;
    activeTab: number;
  }
> = new Map();

app.get("/browser/session", async (c) => {
  const browser = await spawnBrowser();
  const page = await createPage("https://www.google.com", browser);
  const sessionId = Math.random().toString(36).substring(2);

  browserSessions.set(sessionId, {
    browser,
    pages: [page],
    wsClients: new Set(),
    activeTab: 0, // Track active tab in session
  });

  return c.json({ sessionId });
});

app.get(
  "/browser",
  upgradeWebSocket(async (c) => {
    let sessionId: string | null = null;
    let screenshotTimer: Timer | null = null;

    return {
      onOpen: async (_, ws) => {
        console.log("WebSocket client connected to /browser");
      },
      onMessage: async (event, ws) => {
        const data = JSON.parse(event.data as string);
        const {
          sessionId: incomingSessionId,
          type,
          x,
          y,
          value,
          tabIndex,
          deltaY,
        } = data;

        if (incomingSessionId && !sessionId) {
          sessionId = incomingSessionId;
          const session = browserSessions.get(sessionId!);
          if (!session) {
            ws.send(JSON.stringify({ error: "Session not found" }));
            return;
          }
          session.wsClients.add(ws);

          screenshotTimer = setInterval(async () => {
            const activePage =
              session.pages[session.activeTab] || session.pages[0];
            const screenshot = await activePage.screenshot();
            const base64Screenshot = screenshot.toString("base64");
            const viewport = await activePage.viewportSize();
            ws.send(
              JSON.stringify({
                type: "screenshot",
                content: `data:image/png;base64,${base64Screenshot}`,
                viewport: viewport || { width: 1280, height: 720 },
              })
            );
          }, 30);
        }

        const session = browserSessions.get(sessionId!);
        if (!session) {
          ws.send(JSON.stringify({ error: "Session not found" }));
          return;
        }

        const page = session.pages[tabIndex ?? session.activeTab];

        switch (type) {
          case "click":
            await page.mouse.click(x, y);
            break;
          case "type":
            await page.keyboard.type(value);
            break;
          case "newTab":
            const newPage = await createPage(
              "https://www.google.com",
              session.browser
            );
            session.pages.push(newPage);
            session.activeTab = session.pages.length - 1; // Set new tab as active
            session.wsClients.forEach((client) =>
              client.send(
                JSON.stringify({
                  tabs: session.pages.length,
                  activeTab: session.activeTab,
                })
              )
            );
            break;
          case "switchTab":
            if (session.pages[tabIndex] && tabIndex !== session.activeTab) {
              session.activeTab = tabIndex;
              await session.pages[tabIndex].bringToFront();
              session.wsClients.forEach((client) =>
                client.send(JSON.stringify({ activeTab: tabIndex }))
              );
            }
            break;
          case "scroll":
            await page.mouse.wheel(0, deltaY); // Scroll vertically
            break;
          default:
            if (type !== undefined) {
              ws.send(JSON.stringify({ error: "Unknown action" }));
            }
        }

        if (type && ["click", "type", "scroll"].includes(type)) {
          const screenshot = await page.screenshot();
          const base64Screenshot = screenshot.toString("base64");
          const viewport = await page.viewportSize();
          ws.send(
            JSON.stringify({
              type: "screenshot",
              content: `data:image/png;base64,${base64Screenshot}`,
              viewport: viewport || { width: 1280, height: 720 },
            })
          );
        }
      },
      onClose: async (_, ws) => {
        if (screenshotTimer !== null) {
          clearInterval(screenshotTimer);
          screenshotTimer = null;
        }
        if (sessionId) {
          const session = browserSessions.get(sessionId);
          if (session) {
            session.wsClients.delete(ws);
            if (session.wsClients.size === 0) {
              await session.browser.close();
              browserSessions.delete(sessionId);
            }
          }
        }
      },
    };
  })
);
export default {
  port: 8080,
  fetch: app.fetch,
  websocket,
};
