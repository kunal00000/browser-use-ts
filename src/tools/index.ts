import type { ElementHandle, Page } from "playwright";
import { markInteractableElements } from "../mark-elements/helpers";
import { MARKERS, updateMarkers } from "../mark-elements";

export async function fillInput(
  page: Page,
  { id, input }: { id: number; input: string }
) {
  const element = await MARKERS.get(id);

  if (element) {
    await element.fill(input);
  } else {
    console.log("Element not found");
  }
}

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

  if (
    (await element.evaluate((el: HTMLElement) => el.tagName.toLowerCase())) ===
    "a"
  ) {
    const newPage = await handleLinkInNewTab(page, element);

    return newPage;
  }

  await element.click();

  return page;
}

export const tools: Record<string, Function> = {
  gotowebsite: goToWebsite,
  requestscreenshot: requestScreenshot,
  clickelementwithid: clickElementWithId,
  typeininput: fillInput,
};

//Misc Helpers

export const handleLinkInNewTab = async (
  page: Page,
  element: ElementHandle
) => {
  const popupPromise = page.waitForEvent("popup");
  await element.evaluate((el: HTMLElement) => {
    el.setAttribute("target", "_blank");
  });
  await element.click();
  const newPage = await popupPromise;
  await newPage.waitForLoadState("domcontentloaded");
  await newPage.bringToFront();
  return newPage;
};
