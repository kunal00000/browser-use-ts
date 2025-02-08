import * as pw from "playwright";

export async function spawnBrowser() {
  const browser = await pw.chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  await page.screenshot({ path: "google.png" });
}

spawnBrowser();
