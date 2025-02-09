import { createPage, spawnBrowser } from "./src/browser";
import { agent } from "./src/agent";

const GOOGLE_DOT_COM = "https://www.google.com";

async function main(url: string, id: number) {
  const browser = await spawnBrowser();
  const page = await createPage(GOOGLE_DOT_COM, browser);

  await agent(page);

  await browser.close();
}

// main("https://www.google.com/maps", 16);

main("https://news.ycombinator.com/news", 16);
