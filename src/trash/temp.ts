import type { Page } from "playwright";
import type { ElementHandle } from "playwright";
import { click } from "../tools";

export async function findAndClickLink(page: Page) {
  const links: Set<String> = new Set();
  const filteredElements: Set<ElementHandle<HTMLAnchorElement>> = new Set();

  const elements = await page.$$("a");
  for (const element of elements) {
    const href = await element.evaluate((el) => el.href);
    if (href) {
      links.add(href);
      filteredElements.add(element);

      // Add random color border to each link

      const linkNumber = filteredElements.size;
      await element.evaluate((el, number) => {
        const randomColor =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
        el.style.border = `2px solid ${randomColor}`;
        el.style.position = "relative";

        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = randomColor;
        overlay.style.opacity = "0.2";
        overlay.style.pointerEvents = "none";

        const numberLabel = document.createElement("span");
        numberLabel.textContent = number.toString();
        numberLabel.style.position = "absolute";
        numberLabel.style.top = "0";
        numberLabel.style.right = "0";
        numberLabel.style.background = "#fff";
        numberLabel.style.padding = "2px 5px";

        el.appendChild(overlay);
        el.appendChild(numberLabel);
      }, linkNumber);
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
