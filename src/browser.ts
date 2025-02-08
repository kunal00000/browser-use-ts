import * as pw from "playwright";

export type Input = {
  cookie: string;
};

export async function spawnBrowser(input?: Input) {
  const browser = await pw.chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
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
