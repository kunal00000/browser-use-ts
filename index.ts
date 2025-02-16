import * as dotenv from "dotenv";
dotenv.config();
import { createPage, spawnBrowser } from "./src/browser";
import { agent } from "./src/agent";

// const INIT_URL = "https://www.google.com";

const INIT_URL = "https://bolt.new/";

async function main() {
  const browser = await spawnBrowser();

  const context = await browser.newContext();

  context.addCookies([
    {
      name: "__session",
      domain: "bolt.new",
      path: "/",
      value:
        "eyJkIjoiOUlSVzdzR0UyUHp0OS9ZazhJejlYci8zV1RsU0lBV285Ym9UVUtMeUR0dHpVWGFwZnpSbVVCc0JnWVBDWU5DL09sL2NZbWd6eUZWOWhacU8yOEQvVmFSTldSTE5MVGdBMWYwSUtDWk85elJjTGpvV2VORUhiWmVNbGgrZGpkbEZ6eGJib1JDTjlZTVZNMEljRnZ3VnV3UXNEZDlPa0tUMUo4a0xST1E3QVhIdVlVVC8zSGtqd0JPcldJSEdvS0tiY2JLTjRRaGxIODhlbWRLTFFoRmI2ZzBGNUVLYVhoaEJ2YkFNaDdubU95NHY1dEZIY3FNMlFYRXNaY0Vla1ZZL3Uxc1NPQlN5QmRrcmJjbDk1Q21ocURXSUhhWUppSG1jYlliZG1STnNtU1ZtdVkzVVBqUHUwYTA3UFlOZkZ3RlVrVjlUdmRpTk55SkswVVFGckJ1dW9uaUFOQ0RlLzVGOEdlNHMvdzkwalkyWmFVeWI3VzB3dmdvOW4yNGtpT2hScFdYTFU0K1J0VTBhYWJaR0ttUk9xNHU3WmtPWC91MEx3b0pwWGFwYTI4RlFnTXNucHMxMk91Rld3L0FzUEhKUyJ9.RSk0CAI4ZeWOp9p9jozWEKnU07qs3%2FbEmiSkOLI%2BxvI",
    },
    {
      name: "ahoy_visitor",
      domain: "bolt.new",
      value: "aab1d7d2-cdd1-4da2-b326-48c47660fed62",
      path: "/",
    },
  ]);

  const page = await context.newPage();

  await page.goto(INIT_URL);

  await agent(page);

  await browser.close();
}

main();
