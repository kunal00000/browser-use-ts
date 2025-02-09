import { generateObject, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./system-prompt";
import * as z from "zod";
import { tools } from "./tools";
import * as readline from "node:readline/promises";
import type { Page } from "playwright";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function agent(page: Page) {
  const messages: CoreMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];

  try {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    while (true) {
      const result = await generateObject({
        model: google("gemini-2.0-flash-lite-preview-02-05"),
        messages,
        schema: z.discriminatedUnion("type", [
          z.object({
            type: z.enum(["action"]),
            function: z.string(),
            input: z.string(),
          }),
          z.object({
            type: z.enum(["observation"]),
            observation: z.any(),
          }),
          z.object({
            type: z.enum(["output"]),
            output: z.string(),
          }),
          z.object({
            type: z.enum(["plan"]),
            plan: z.string(),
          }),
          z.object({
            type: z.enum(["input"]),
            inputQuery: z.string(),
          }),
        ]),
      });

      console.log(JSON.stringify(result.object, null, 2));

      if (result.object.type === "output") {
        break;
      } else if (result.object.type === "action") {
        const func = tools[result.object.function];
        const observation = await func(page, JSON.parse(result.object.input));
        const obs = {
          type: "observation",
          observation: `${JSON.stringify(observation)}`,
        };

        console.log(observation);

        messages.push({
          role: "assistant",
          content: JSON.stringify(obs),
        });
      }

      messages.push({
        role: "assistant",
        content: JSON.stringify(result.object),
      });

      if (result.object.type === "input") {
        const userInput = await terminal.question(
          "Assistant: " + result.object.inputQuery + "\nYou: "
        );

        messages.push({ role: "user", content: userInput });
      }
    }
  } catch (error) {
    console.error(error);
  }
}
