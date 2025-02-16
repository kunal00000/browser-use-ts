import * as dotenv from "dotenv";
dotenv.config();
import { createPage, spawnBrowser } from "./src/browser";
import { agent } from "./src/agent";

const INIT_URL = "https://www.google.com";

// const INIT_URL = "https://practicetestautomation.com/practice-test-login/";

async function main() {
  const browser = await spawnBrowser();
  const page = await createPage(INIT_URL, browser);

  // await page.locator("#username").fill("student");

  await agent(page);

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
