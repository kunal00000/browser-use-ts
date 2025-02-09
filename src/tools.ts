import { clickElementWithId } from "./click";
import { requestScreenshot } from "./screenshot";

export const tools: Record<string, Function> = {
  requestScreenshot: requestScreenshot,
  clickElementWithId: clickElementWithId,
};
