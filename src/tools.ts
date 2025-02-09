import { clickElementWithId } from "./tools/click";
import { goToWebsite } from "./tools/go-to-website";
import { requestScreenshot } from "./tools/screenshot";

export const tools: Record<string, Function> = {
  goToWebsite: goToWebsite,
  requestScreenshot: requestScreenshot,
  clickElementWithId: clickElementWithId,
};
