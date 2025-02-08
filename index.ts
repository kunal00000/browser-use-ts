import { spawnBrowser } from "./src/browser";
import { click } from "./src/click";
import { marker } from "./src/mark";

async function main() {
  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");

  const markers = await marker(page);

  const element = markers.get(32);

  const boundingBox = await element!.boundingBox();

  await click(page, boundingBox);

  await page.screenshot({ path: "ss.png" });

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
