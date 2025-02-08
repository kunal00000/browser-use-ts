import type { Page } from "playwright";
import type { ElementHandle } from "playwright";
import { createHighlight } from "./create-highlight";

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

    await element.evaluate((el, number) => createHighlight(el, number), i);
  }

  return elementMap;
}

// const randomColor =
//   "#" + Math.floor(Math.random() * 16777215).toString(16);
// const originalPosition = window.getComputedStyle(el).position;

// // Only set position relative if it's static
// if (originalPosition === "static") {
//   el.style.position = "relative";
// }

// const overlay = document.createElement("div");
// overlay.style.position = "absolute";
// overlay.style.top = "0";
// overlay.style.left = "0";
// overlay.style.width = "100%";
// overlay.style.height = "100%";
// overlay.style.backgroundColor = randomColor;
// overlay.style.opacity = "0.2";
// overlay.style.pointerEvents = "none";
// overlay.style.zIndex = "1";

// const numberLabel = document.createElement("span");
// numberLabel.textContent = number.toString();
// numberLabel.style.position = "absolute";
// numberLabel.style.top = "0";
// numberLabel.style.right = "0";
// numberLabel.style.background = randomColor;
// numberLabel.style.color = "#000";
// numberLabel.style.padding = "1px 1px";
// numberLabel.style.pointerEvents = "none";
// numberLabel.style.zIndex = "2";
// numberLabel.style.fontSize = "10px";
// numberLabel.style.fontWeight = "bold";

// el.appendChild(overlay);
// el.appendChild(numberLabel);
