import * as pw from "playwright";

export async function spawnBrowser() {
  const browser = await pw.chromium.launch({ headless: false });
  return browser;
}

export async function closeBrowser(browser: pw.Browser) {
  await browser.close();
}
