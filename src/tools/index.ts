import type { Page } from "playwright";
import { markInteractableElements } from "../mark-elements/helpers";
import { MARKERS, updateMarkers } from "../mark-elements";

export async function requestScreenshot(page: Page) {
  const markers = await markInteractableElements(page);
  updateMarkers(markers);

  await page.screenshot({ path: "ss.png" });
}

export async function goToWebsite(page: Page, { url }: { url: string }) {
  await page.goto(url);
  return page;
}

export async function click(
  page: Page,
  boundingBox: { x: number; y: number; width: number; height: number } | null
) {
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

export const tools: Record<string, Function> = {
  gotowebsite: goToWebsite,
  requestscreenshot: requestScreenshot,
  clickelementwithid: clickElementWithId,
};
