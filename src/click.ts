import type { Page } from "playwright";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export async function click(page: Page, boundingBox: BoundingBox) {
  if (boundingBox) {
    await page.mouse.click(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );
  } else {
    console.log("No bounding box found");
  }
}
