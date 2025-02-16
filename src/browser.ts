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

export async function addCookies(browser: pw.Browser) {
  const context = await browser.newContext();

  context.addCookies([
    {
      name: "__session",
      value:
        "eyJkIjoiOUlSVzdzR0UyUHp0OS9ZazhJejlYci8zV1RsU0lBV285Ym9UVUtMeUR0dHpVWGFwZnpSbVVCc0JnWVBDWU5DL09sL2NZbWd6eUZWOWhacU8yOEQvVmFSTldSTE5MVGdBMWYwSUtDWk85elJjTGpvV2VORUhiWmVNbGgrZGpkbEZ6eGJib1JDTjlZTVZNMEljRnZ3VnV3UXNEZDlPa0tUMUo4a0xST1E3QVhIdVlVVC8zSGtqd0JPcldJSEdvS0tiY2JLTjRRaGxIODhlbWRLTFFoRmI2ZzBGNUVLYVhoaEJ2YkFNaDdubU95NHY1dEZIY3FNMlFYRXNaY0Vla1ZZL3Uxc1NPQlN5QmRrcmJjbDk1Q21ocURXSUhhWUppSG1jYlliZG1STnNtU1ZtdVkzVVBqUHUwYTA3UFlOZkZ3RlVrVjlUdmRpTk55SkswVVFGckJ1dW9uaUFOQ0RlLzVGOEdlNHMvdzkwalkyWmFVeWI3VzB3dmdvOW4yNGtpT2hScFdYTFU0K1J0VTBhYWJaR0ttUk9xNHU3WmtPWC91MEx3b0pwWGFwYTI4RlFnTXNucHMxMk91Rld3L0FzUEhKUyJ9.RSk0CAI4ZeWOp9p9jozWEKnU07qs3%2FbEmiSkOLI%2BxvI",
      url: "https://bolt.new/",
    },
  ]);
}
