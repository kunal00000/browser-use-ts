import { spawnBrowser } from "./src/browser";

async function main() {
  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");
  // await page.screenshot({ path: "ss.png" });

  await page.waitForTimeout(2000);

  await page.mouse.wheel(0, 500);

  await page.waitForTimeout(5000);

  await browser.close();
}

main();
