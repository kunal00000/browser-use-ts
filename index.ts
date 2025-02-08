import { spawnBrowser } from "./src/browser";
import { click } from "./src/click";
import { marker } from "./src/mark";
import { findAndClickInput, findAndClickLink } from "./src/temp";

async function main() {
  const browser = await spawnBrowser();

  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/news");

  const markers = await marker(page);

  // console.log(markers);

  // await page
  //   .getByText("U.K. orders Apple to let it spy on users' encrypted accounts")
  //   .click();

  await page.waitForTimeout(50000);

  await browser.close();
}

main();
