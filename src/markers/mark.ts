import type { ElementHandle, Page } from "playwright";

export async function marker(page: Page) {
  // Find all potentially clickable elements
  const clickableElements = await page.$$(
    [
      "a", // Links
      "button", // Buttons
      '[role="button"]', // ARIA button roles
      'input[type="button"]', // Input buttons
      'input[type="submit"]', // Submit buttons
      "[onclick]", // Elements with onclick handlers
      '[class*="btn"]', // Common button class patterns
      '[class*="button"]',
    ].join(",")
  );

  // Create a Map to store elements with their indices
  const elementMap: Map<number, ElementHandle> = new Map();

  // Assign index and color to each element
  const promises = clickableElements.map((element, idx) => {
    elementMap.set(idx, element);

    return element.evaluate((el, number) => {
      let container = document.getElementById("playwright-highlight-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "playwright-highlight-container";
        container.style.position = "absolute";
        container.style.pointerEvents = "none";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.zIndex = "2147483647";
        document.body.appendChild(container);
      }

      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);

      const rect = el.getBoundingClientRect();
      let top = rect.top + window.scrollY;
      let left = rect.left + window.scrollX;

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.border = `1px solid ${randomColor}`;
      overlay.style.backgroundColor = randomColor + "1A";
      overlay.style.pointerEvents = "none";
      overlay.style.boxSizing = "border-box";
      overlay.style.padding = "2px";
      overlay.style.top = `${top}px`;
      overlay.style.left = `${left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.zIndex = "8";

      const numberLabel = document.createElement("span");
      numberLabel.textContent = number.toString();
      numberLabel.style.position = "absolute";
      numberLabel.style.padding = "1px";
      numberLabel.style.background = randomColor;
      numberLabel.style.color = "#fff";
      numberLabel.style.pointerEvents = "none";
      numberLabel.style.fontSize = el.style.fontSize || "10px";
      numberLabel.style.zIndex = "9";

      let labelWidth;
      switch (number.toString().length) {
        case 1:
          labelWidth = 7;
          break;
        case 2:
          labelWidth = 13;
          break;
        case 3:
          labelWidth = 19;
          break;
        case 4:
          labelWidth = 25;
          break;
        default:
          labelWidth = 13;
      }

      numberLabel.style.top = top + "px";
      numberLabel.style.left = left + rect.width - labelWidth - 2 + "px";

      container.appendChild(overlay);
      container.appendChild(numberLabel);
    }, idx);
  });

  await Promise.all(promises);

  return elementMap;
}
