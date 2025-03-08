import * as pw from "playwright";

export async function spawnBrowser() {
  const browser = await pw.chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"], // this is to prevent Playwright from being detected by websites as a bot
  });

  return browser;
}

export async function closeBrowser(browser: pw.Browser) {
  await browser.close();
}

export async function createPage(url: string, browser: pw.Browser) {
  const page = await browser.newPage();
  await page.goto(url);

  return page;
}

export async function getPages(browser: pw.Browser): Promise<pw.Page[]> {
  return browser.contexts()[0]?.pages() || [];
}
