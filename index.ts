import { spawnBrowser } from "./src/browser";
import type { ElementHandle } from "playwright";

async function main() {
  const links: Set<String> = new Set();
  const filteredElements: Set<ElementHandle<HTMLAnchorElement>> = new Set();

  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");

  const elements = await page.$$("a");
  for (const element of elements) {
    const href = await element.evaluate((el) => el.href);
    if (href && !href.includes("ycombinator")) {
      links.add(href);
      filteredElements.add(element);

      // Add random color border to each link

      await element.evaluate((el) => {
        const randomColor =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
        el.style.border = `2px solid ${randomColor}`;
      });
    }
  }

  const blogOne = [...filteredElements][0];

  const boundingBox = await blogOne.boundingBox();

  if (boundingBox) {
    await page.mouse.click(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );
  }

  // console.log(links);

  // await page.screenshot({ path: "ss.png" });

  // await page.waitForTimeout(2000);

  // await page.mouse.wheel(0, 500);

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
