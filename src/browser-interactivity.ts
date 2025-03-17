import type { ServerWebSocket } from "bun";
import type { BrowserInput } from "./types";
import type { WSContext } from "hono/ws";
import type { BrowserManager } from "./browser";

export async function handleBrowserInteractivity({
  browserInput,
  browserManager,
  ws,
}: {
  browserInput: BrowserInput;
  browserManager: BrowserManager;
  ws: WSContext<ServerWebSocket>;
}) {
  await browserManager.handleBrowserInteractivity(browserInput);
}
