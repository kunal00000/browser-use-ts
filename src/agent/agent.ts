import { google } from "@ai-sdk/google";
import { generateObject, type CoreMessage, type ImagePart } from "ai";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { readFileSync } from "node:fs";
import type { Page } from "playwright";
import { SYSTEM_PROMPT } from "../constants/system-prompt";
import { requestScreenshot, tools } from "../tools";
import type { AgentResponse } from "../types";
import { agentResponseSchema } from "./schema";
import { BrowserManager } from "../browser";

interface WebSocketMessage {
  type: "USER_INPUT" | "REQUEST_INPUT" | "AI_RESPONSE" | "ERROR" | "SCREENSHOT";
  content: string;
  requiresInput?: boolean;
}

export class Agent {
  private messages: CoreMessage[];
  private messageCount: number;
  private page: Page;
  private ws: WSContext<ServerWebSocket>;
  private base64ImageUrl: string | null;

  constructor({
    browserManager,
    ws,
  }: {
    browserManager: BrowserManager;
    ws: WSContext<ServerWebSocket>;
  }) {
    this.messages = [{ role: "system", content: SYSTEM_PROMPT }];
    this.messageCount = 0;
    this.page = browserManager.getPage();
    this.ws = ws;
    this.base64ImageUrl = null;
  }

  private sendWebSocketMessage(message: WebSocketMessage) {
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending websocket message:", error);
    }
  }

  private async handleRateLimit(): Promise<void> {
    if (this.messageCount % 10 === 0) {
      this.sendWebSocketMessage({
        type: "AI_RESPONSE",
        content: "Pausing for 1 minute to prevent rate limiting...",
      });
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  private async processScreenshot(): Promise<void> {
    try {
      const imageBytes = readFileSync("./ss.png");
      const images: ImagePart[] = [{ type: "image", image: imageBytes }];

      this.base64ImageUrl = `data:image/png;base64,${imageBytes.toString(
        "base64"
      )}`;

      this.messages.push({ role: "user", content: images });

      this.sendWebSocketMessage({
        type: "SCREENSHOT",
        content: this.base64ImageUrl,
      });

      const isScrollable = await this.page.evaluate(() => {
        return (
          document.documentElement.scrollHeight >
          document.documentElement.clientHeight
        );
      });

      // if (isScrollable) {
      //   this.messages.push({
      //     role: "user",
      //     content:
      //       "There is more content below that can be scrolled to. Try using the scroll tool. (If needed)",
      //   });
      //   this.messageCount++;
      // }
    } catch (error) {
      throw new Error(`Screenshot processing failed: ${error}`);
    }
  }

  private async processAIResponse(response: AgentResponse): Promise<void> {
    try {
      if (!(response.requires_user_input && response.user_prompt)) {
        this.sendWebSocketMessage({
          type: "AI_RESPONSE",
          content: JSON.stringify(response, null, 2),
        });

        if (response.state === "ACTION") {
          const action = response.action;

          if (!action) return;

          try {
            const toolName = action.tool.toLowerCase();
            const func = tools[toolName];
            const observation = await func(this.page, action.input);

            switch (toolName) {
              case "gotowebsite":
                this.page = observation as Page;
                break;

              case "requestscreenshot":
                await this.processScreenshot();
                break;

              case "clickelementwithid":
                this.page = observation as Page;
                await requestScreenshot(this.page);
                await this.processScreenshot();
                break;

              case "typeininput":
                //TODO: Implement this tool too
                break;

              default:
                this.messages.push({
                  role: "assistant",
                  content: JSON.stringify({
                    state: "OBSERVATION",
                    thought: "Processing action result",
                    observation: observation,
                  }),
                });
                this.messageCount++;
                break;
            }
          } catch (error) {
            throw new Error(`Action execution failed: ${error}`);
          }
        }

        this.messages.push({
          role: "assistant",
          content: JSON.stringify(response),
        });
        this.messageCount++;

        if (response.state === "OUTPUT") {
          this.sendWebSocketMessage({
            type: "REQUEST_INPUT",
            content: "Please provide your input",
            requiresInput: true,
          });
        } else {
          this.callAI();
        }
      } else {
        this.sendWebSocketMessage({
          type: "REQUEST_INPUT",
          content: "Please provide your input",
          requiresInput: true,
        });
      }
    } catch (error) {
      throw new Error(`AI response processing failed: ${error}`);
    }
  }

  public async callAI(message?: string): Promise<void> {
    try {
      if (message) {
        this.messages.push({ role: "user", content: message });
        this.messageCount++;
      }

      await this.handleRateLimit();

      const result = await generateObject({
        model: google("gemini-2.0-flash-exp", {
          structuredOutputs: false,
        }),
        mode: "json",
        messages: this.messages,
        schema: agentResponseSchema,
      });

      await this.processAIResponse(result.object as AgentResponse);
    } catch (error) {
      console.error("Agent execution failed:", error);
      this.sendWebSocketMessage({
        type: "ERROR",
        content: `Error: ${error}`,
      });
    }
  }
}
