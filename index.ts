import * as dotenv from "dotenv";
dotenv.config();
import { createPage, spawnBrowser } from "./src/browser";
import { agent } from "./src/agent";

const INIT_URL = "https://www.google.com";

async function main() {
  const browser = await spawnBrowser();
  const page = await createPage(INIT_URL, browser);

  await agent(page);

  await browser.close();
}

main();
