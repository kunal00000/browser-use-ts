import * as pw from "playwright";
import type { BrowserInput } from "./types";

export class BrowserManager {
  private static instance: BrowserManager;
  private static initializing: Promise<void>;

  private browser: pw.Browser;
  private context: pw.BrowserContext;
  private page: pw.Page;

  private constructor({
    browser,
    context,
    page,
  }: {
    browser: pw.Browser;
    context: pw.BrowserContext;
    page: pw.Page;
  }) {
    this.browser = browser;
    this.context = context;
    this.page = page;
  }

  public static async getInstance(): Promise<BrowserManager> {
    if (BrowserManager.instance) {
      return BrowserManager.instance;
    }

    if (!BrowserManager.initializing) {
      BrowserManager.initializing = (async () => {
        const browser = await BrowserManager.spawnBrowser();
        const context = await browser.newContext();
        const page = await context.newPage();
        BrowserManager.instance = new BrowserManager({
          browser,
          context,
          page,
        });
      })();
    }

    await BrowserManager.initializing;
    return BrowserManager.instance;
  }

  private static setInstance(): void {
    BrowserManager.initializing = (async () => {
      const browser = await BrowserManager.spawnBrowser();
      const context = await browser.newContext();
      const page = await context.newPage();
      BrowserManager.instance = new BrowserManager({
        browser,
        context,
        page,
      });
    })();
  }

  public getBrowser(): pw.Browser {
    return this.browser;
  }

  public getContext(): pw.BrowserContext {
    return this.context;
  }

  public getPage(): pw.Page {
    return this.page;
  }

  public setContext(newContext: pw.BrowserContext): void {
    if (newContext.browser() !== this.browser) {
      throw new Error(
        "Context does not belong to the same browser as the BrowserManager instance"
      );
    }

    this.context = newContext;
  }

  public setPage(newPage: pw.Page): void {
    if (newPage.context() !== this.context) {
      throw new Error(
        "Page does not belong to the same context as the BrowserManager instance"
      );
    }

    this.page = newPage;
  }

  private static async spawnBrowser() {
    const browser = await pw.chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"], // this is to prevent Playwright from being detected by websites as a bot
      timeout: 0,
    });

    return browser;
  }

  public async createPage(url: string) {
    await this.page.goto(url);
  }

  public async closeBrowser() {
    BrowserManager.setInstance();

    await this.browser.close();
  }

  public async takeScreenshot() {
    return await this.page.screenshot();
  }

  public async handleBrowserInteractivity(browserInput: BrowserInput) {
    const { type, x, y, value, deltaY } = browserInput;

    switch (type) {
      case "click":
        if (x && y) {
          await this.page.mouse.click(x, y);
        }
        break;
      case "type":
        if (value) {
          await this.page.keyboard.type(value);
        }
        break;
      case "scroll":
        if (deltaY) {
          await this.page.mouse.wheel(0, deltaY);
        }
        break;
      case "stream":
        break;
    }
  }
}
