import type { ElementHandle, Page } from "playwright";
import { MARKERS } from "../markers/mark-utils";

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

export async function clickElementWithId(page: Page, { id }: { id: number }) {
  const element = MARKERS.get(id);

  if (!element) {
    console.log("Element not found");
    return;
  }

  const boundingBox = await element.boundingBox();

  await click(page, boundingBox);
}
