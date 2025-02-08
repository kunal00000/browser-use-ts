import { spawnBrowser } from "./src/browser";
import { click } from "./src/click";
import {
  findAndClickInput,
  findAndClickLink,
  findAndClickLinkTemp,
} from "./src/temp";

async function main() {
  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");

  // findAndClickLink(page);

  // Add a red dot at the click position
  await page.evaluate(() => {
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.left = "54px";
    dot.style.top = "61px";
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.backgroundColor = "red";
    dot.style.borderRadius = "50%";
    dot.style.zIndex = "10000";
    document.body.appendChild(dot);
  });

  await page
    .getByText("U.K. orders Apple to let it spy on users' encrypted accounts")
    .click();

  // await page.mouse.click(54, 61);

  // await page.waitForTimeout(2000);

  // await findAndClickInput(page, "Hello World");

  await page.screenshot({ path: "ss.png" });

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
