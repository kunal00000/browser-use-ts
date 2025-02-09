import type { ElementHandle } from "playwright";
import { createPage, spawnBrowser } from "./src/browser";
import { click } from "./src/click";
import { marker } from "./src/markers/mark";
import { updateMarkers } from "./src/markers/mark-utils";

const GOOGLE_DOT_COM = "https://www.google.com";

async function main(url: string, id: number) {
  const browser = await spawnBrowser();
  const page = await createPage(GOOGLE_DOT_COM, browser);

  const markers = await marker(page);

  updateMarkers(markers);

  await page.screenshot({ path: "ss.png" });

  // const element = markers.get(id);
  // const boundingBox = await element!.boundingBox();
  // await click(page, boundingBox);

  await page.waitForTimeout(500000000);

  await browser.close();
}

// main("https://www.google.com/maps", 16);

main("https://news.ycombinator.com/news", 16);
