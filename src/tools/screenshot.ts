import type { Page } from "playwright";
import { marker } from "../markers/mark";
import { updateMarkers } from "../markers/mark-utils";

export async function requestScreenshot(page: Page) {
  const markers = await marker(page);
  updateMarkers(markers);

  await page.screenshot({ path: "ss.png" });
}
