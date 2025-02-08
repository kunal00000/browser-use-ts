import type { Page } from "playwright";
import type { ElementHandle } from "playwright";

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
  for (let i = 0; i < clickableElements.length; i++) {
    const element = clickableElements[i];
    elementMap.set(i, element);

    // Apply styling and numbering to the element
    await element.evaluate((el, number) => {
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      const originalPosition = window.getComputedStyle(el).position;

      // Only set position relative if it's static
      if (originalPosition === "static") {
        el.style.position = "relative";
      }

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = randomColor;
      overlay.style.opacity = "0.2";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "1";

      const label = document.createElement("span");
      label.textContent = number.toString();
      label.style.position = "absolute";
      label.style.top = "0";
      label.style.right = "0";
      label.style.background = randomColor;
      label.style.color = "#FFF";
      label.style.padding = "1px 1px";
      label.style.pointerEvents = "none";
      label.style.zIndex = "2";
      label.style.fontSize = "10px";
      label.style.fontWeight = "bold";

      el.appendChild(overlay);
      el.appendChild(label);
    }, i);
  }

  return elementMap;
}
