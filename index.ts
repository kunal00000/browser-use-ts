import { spawnBrowser } from "./src/browser";
import { findAndClickLink } from "./src/temp";

async function main() {
  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");

  findAndClickLink(page);

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
