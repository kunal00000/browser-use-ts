import { generateObject, type CoreMessage, type ImagePart } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "../constants/system-prompt";
import * as z from "zod";
import { requestScreenshot, tools } from "../tools";
import * as readline from "node:readline/promises";
import type { Page } from "playwright";
import { readFileSync } from "node:fs";
import { agentResponseSchema } from "./schema";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
export async function agent(initPage: Page) {
  const messages: CoreMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];
  let page = initPage;
  let messageCount = 0;

  try {
    const userInput = await terminal.question("You: ");
    messages.push({ role: "user", content: userInput });

    while (true) {
      messageCount++;
      if (messageCount % 10 === 0) {
        console.log("Pausing for 1 minute to prevent rate limiting...");
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1-minute delay
      }

      const result = await generateObject({
        model: google("gemini-2.0-flash-exp", {
          structuredOutputs: false,
        }),
        mode: "json",
        messages,
        schema: agentResponseSchema,
      });

      console.log(JSON.stringify(result.object, null, 2));

      if (result.object.state === "OUTPUT") {
        console.log("Final output:", result.object.final_output);
        const userInput = await terminal.question("\nYou: ");
        messages.push({ role: "user", content: userInput });
      } else if (result.object.state === "ACTION" && result.object.action) {
        const func = tools[result.object.action.tool.toLowerCase()];
        const observation = await func(page, result.object.action.input);

        if (result.object.action.tool.toLowerCase() === "gotowebsite") {
          page = observation as Page;
        } else if (
          result.object.action.tool.toLowerCase() === "requestscreenshot"
        ) {
          const imageBytes = readFileSync("./ss.png");
          const images: ImagePart[] = [{ type: "image", image: imageBytes }];

          console.log("---- screenshot sent -----");

          messages.push({ role: "user", content: images });

          const isScrollable = await page.evaluate(() => {
            return (
              document.documentElement.scrollHeight >
              document.documentElement.clientHeight
            );
          });

          if (isScrollable) {
            console.log("---- scroll available -----");

            // messages.push({
            //   role: "user",
            //   content:
            //     "There is more content below that can be scrolled to. Try using the scroll tool. (If needed)",
            // });
          }
        } else if (
          result.object.action.tool.toLowerCase() === "clickelementwithid"
        ) {
          // send screenshot after click
          page = observation as Page;
          await requestScreenshot(page);
          const imageBytes = readFileSync("./ss.png");
          const images: ImagePart[] = [{ type: "image", image: imageBytes }];

          console.log("---- screenshot sent -----");
          messages.push({ role: "user", content: images });
        } else {
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              state: "OBSERVATION",
              thought: "Processing action result",
              observation: observation,
            }),
          });
        }
      }

      messages.push({
        role: "assistant",
        content: JSON.stringify(result.object),
      });

      if (result.object.requires_user_input && result.object.user_prompt) {
        const userInput = await terminal.question(
          "Assistant: " + result.object.user_prompt + "\nYou: "
        );

        //TODO: Add later

        // messages.push({
        //   role: "user",
        //   content:
        //     "Start with finding google search results. Try to you the given tools: goToWebsite, requestScreenshot and clickElementWithId.",
        // });
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    terminal.close();
  }
}
