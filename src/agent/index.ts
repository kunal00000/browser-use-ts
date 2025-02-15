import { generateObject, type CoreMessage, type ImagePart } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "../constants/system-prompt";
import * as z from "zod";
import { tools } from "../tools";
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

  try {
    const userInput = await terminal.question("You: ");
    messages.push({ role: "user", content: userInput });

    while (true) {
      const result = await generateObject({
        model: google("gemini-exp-1206", {
          structuredOutputs: false,
        }),
        messages,
        schema: agentResponseSchema,
      });

      console.log(JSON.stringify(result.object, null, 2));

      if (result.object.state === "OUTPUT") {
        console.log("Final output:", result.object.final_output);
        break;
      } else if (result.object.action) {
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
        messages.push({ role: "user", content: userInput });
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    terminal.close();
  }
}
