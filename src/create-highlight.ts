export function createHighlight(el: HTMLElement | SVGElement, number: number) {
  // Create or get highlight container
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
    container.style.zIndex = "2147483647"; // Maximum z-index value
    document.body.appendChild(container);

    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    // Create overlay

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.border = `2px solid ${randomColor}`;
    overlay.style.backgroundColor = randomColor;
    overlay.style.pointerEvents = "none";
    overlay.style.boxSizing = "border-box";
    overlay.style.opacity = "0.2";
  }
}
