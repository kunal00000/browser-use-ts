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

  await click(page, boundingBox);
}

export async function findAndClickInput(page: Page, inputText: string) {
  const inputs = await page.$$("input");
  for (const input of inputs) {
    const type = await input.evaluate((el) => el.type);
    if (type === "text") {
      await input.fill(inputText);
    }
  }
}
export async function findAndClickLinkTemp(page: Page) {
  const links: Set<String> = new Set();
  const filteredElements: Set<ElementHandle<HTMLAnchorElement>> = new Set();
  const searchText =
    "U.K. orders Apple to let it spy on users' encrypted accounts ";

  const elements = await page.$$("a");
  for (const element of elements) {
    const href = await element.evaluate((el) => el.href);
    const text = await element.evaluate((el) => el.textContent);

    if (
      href &&
      !href.includes("ycombinator") &&
      text &&
      text.trim() === searchText
    ) {
      links.add(href);
      filteredElements.add(element);

      await element.evaluate((el) => {
        const randomColor =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
        el.style.border = `2px solid ${randomColor}`;
      });
    }
  }

  const blogOne = [...filteredElements][0];
  if (blogOne) {
    const boundingBox = await blogOne.boundingBox();
    await click(page, boundingBox);
  }
}
