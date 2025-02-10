import { generateObject, type CoreMessage, type ImagePart } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./system-prompt";
import * as z from "zod";
import { tools } from "./tools";
import * as readline from "node:readline/promises";
import type { Page } from "playwright";
import { readFileSync } from "node:fs";
import { log } from "node:console";
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
        schema: z.object({
          state: z.enum(["INPUT", "PLAN", "ACTION", "OBSERVATION", "OUTPUT"]),
          thought: z.string(),
          action: z
            .object({
              tool: z.string(),
              input: z.record(z.any()),
            })
            .optional(),
          observation: z.any().optional(),
          next_action: z.string().optional(),
          error: z.string().optional(),
          requires_user_input: z.boolean().optional(),
          user_prompt: z.string().optional(),
          final_output: z.string().optional(),
        }),
      });

      console.log(JSON.stringify(result.object, null, 2));

      if (result.object.state === "OUTPUT") {
        console.log("Final output:", result.object.final_output);
        break;
      } else if (result.object.state === "ACTION" && result.object.action) {
        const func = tools[result.object.action.tool.toLowerCase()];

        //TODO: input.url handling -> for all tools basically add if else for each tool

        const observation = await func(page, result.object.action.input.url);

        if (result.object.action.tool.toLowerCase() === "gotowebsite") {
          page = observation as Page;
        }

        if (result.object.action.tool.toLowerCase() === "requestScreenshot") {
          const imageBytes = readFileSync("./ss.png");
          const images: ImagePart[] = [{ type: "image", image: imageBytes }];

          console.log("Screenshot captured");
          log(images);

          messages.push({
            role: "user",
            content: images,
          });
        }

        messages.push({
          role: "assistant",
          content: JSON.stringify({
            state: "OBSERVATION",
            thought: "Processing action result",
            observation: observation,
          }),
        });
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
