import * as pw from "playwright";
import type { BrowserInputData } from "./types";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";

export async function spawnBrowser() {
  const browser = await pw.chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"], // this is to prevent Playwright from being detected by websites as a bot
  });

  return browser;
}

export async function closeBrowser(browser: pw.Browser) {
  await browser.close();
}

export async function createPage(url: string, browser: pw.Browser) {
  const page = await browser.newPage();
  await page.goto(url);

  return page;
}

export async function getPages(browser: pw.Browser): Promise<pw.Page[]> {
  return browser.contexts()[0]?.pages() || [];
}

export async function handleBrowserInteractivity({
  browserInputData,
  page,
  ws,
}: {
  browserInputData: BrowserInputData;
  page: pw.Page;
  ws: WSContext<ServerWebSocket>;
}) {
  const { type, x, y, value, deltaY } = browserInputData;

  switch (type) {
    case "click":
      if (x && y) await page.mouse.click(x, y);
      else console.log("Missing x and y coordinates for click event");
      break;
    case "type":
      if (value) await page.keyboard.type(value);
      break;
    case "scroll":
      if (deltaY) await page.mouse.wheel(0, deltaY);
      break;
  }

  const screenshot = await page.screenshot();
  const base64Screenshot = screenshot.toString("base64");
  ws.send(
    JSON.stringify({
      type: "SCREENSHOT",
      content: `data:image/png;base64,${base64Screenshot}`,
    })
  );
}
