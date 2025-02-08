import type { Page } from "playwright";
import type { ElementHandle } from "playwright";
import { click } from "./click";

export async function findAndClickLink(page: Page) {
  const links: Set<String> = new Set();
  const filteredElements: Set<ElementHandle<HTMLAnchorElement>> = new Set();

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

  click(page, boundingBox);
}
