import type { Page } from "playwright";

export async function goToWebsite(page: Page, { url }: { url: string }) {
  await page.goto(url);
  return page;
}
