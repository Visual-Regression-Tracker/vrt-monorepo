import {
  Config,
  VisualRegressionTracker,
} from "@visual-regression-tracker/sdk-js";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  ElementHandle,
} from "playwright";
import {
  PlaywrightVisualRegressionTracker,
  PageTrackOptions,
  ElementHandleTrackOptions,
} from "./index";
import { mocked, MockedObject } from "jest-mock";

jest.mock("@visual-regression-tracker/sdk-js");

let browserName = chromium.name();
let browserType = chromium;
let browser: Browser;
let context: BrowserContext;
let page: Page;
let playwrightVrt: PlaywrightVisualRegressionTracker;

const config: Config = {
  apiUrl: "http://localhost:4200",
  branchName: "develop",
  project: "Default project",
  apiKey: "BAZ0EG0PRH4CRQPH19ZKAVADBP9E",
  enableSoftAssert: false,
};

beforeAll(async () => {
  browser = await browserType.launch();
  context = await browser.newContext({
    viewport: {
      width: 1800,
      height: 1600,
    },
  });
  page = await context.newPage();
});

afterAll(async () => {
  await browser.close();
});

describe("playwright", () => {
  beforeEach(() => {
    playwrightVrt = new PlaywrightVisualRegressionTracker(browserName, config);
  });

  it("constructor", async () => {
    expect(playwrightVrt["browser"]).toBe(browserName);
    expect(VisualRegressionTracker).toHaveBeenCalledWith(config);
  });

  it("start", async () => {
    await playwrightVrt.start();

    expect(VisualRegressionTracker.prototype.start).toHaveBeenCalled();
  });

  it("stop", async () => {
    await playwrightVrt.stop();

    expect(VisualRegressionTracker.prototype.stop).toHaveBeenCalled();
  });

  describe("track", () => {
    let pageMocked: MockedObject<Page>;
    const screenshot: Buffer = Buffer.from("image mocked");

    beforeEach(() => {
      playwrightVrt["vrt"]["isStarted"] = jest.fn().mockReturnValueOnce(true);
      pageMocked = mocked(page);
      pageMocked.screenshot.mockResolvedValueOnce(screenshot);
    });

    describe("trackPage", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: PageTrackOptions = {
          diffTollerancePercent: 12.31,
          ignoreAreas: [
            {
              x: 1,
              y: 2,
              width: 300,
              height: 400,
            },
          ],
          agent: {
            os: "OS",
            device: "device ",
          },
          screenshotOptions: {
            fullPage: true,
            clip: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
            },
            omitBackground: true,
          },
        };

        await playwrightVrt.trackPage(page, imageName, trackOptions);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserName,
          viewport: `1800x1600`,
          os: trackOptions.agent?.os,
          device: trackOptions.agent?.device,
          diffTollerancePercent: trackOptions.diffTollerancePercent,
          ignoreAreas: trackOptions.ignoreAreas,
        });
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.viewportSize.mockReturnValueOnce(null);

        await playwrightVrt.trackPage(page, imageName);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(undefined);
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserName,
          viewport: undefined,
          os: undefined,
          device: undefined,
          diffTollerancePercent: undefined,
        });
      });
    });

    describe("trackElementHandle", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: ElementHandleTrackOptions = {
          diffTollerancePercent: 12.31,
          ignoreAreas: [
            {
              x: 1,
              y: 2,
              width: 300,
              height: 400,
            },
          ],
          agent: {
            os: "OS",
            device: "device ",
            viewport: "viewport",
          },
          screenshotOptions: {
            omitBackground: true,
            timeout: 12,
          },
        };
        pageMocked.$.mockResolvedValueOnce(
          {} as ElementHandle<SVGElement | HTMLElement>
        );
        const elementHandle = await page.$("#test");
        const elementHandleMocked = mocked(elementHandle);
        elementHandleMocked!.screenshot.mockResolvedValueOnce(screenshot);

        await playwrightVrt.trackElementHandle(
          elementHandle,
          imageName,
          trackOptions
        );

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserName,
          viewport: trackOptions.agent?.viewport,
          os: trackOptions.agent?.os,
          device: trackOptions.agent?.device,
          diffTollerancePercent: trackOptions.diffTollerancePercent,
          ignoreAreas: trackOptions.ignoreAreas,
        });
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.$.mockResolvedValueOnce(
          {} as ElementHandle<SVGElement | HTMLElement>
        );
        const elementHandle = await page.$("#test");
        const elementHandleMocked = mocked(elementHandle);
        elementHandleMocked!.screenshot.mockResolvedValueOnce(screenshot);

        await playwrightVrt.trackElementHandle(elementHandle, imageName);

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(undefined);
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserName,
          viewport: undefined,
          os: undefined,
          device: undefined,
          diffTollerancePercent: undefined,
        });
      });

      it("should throw if no elementHandle", async () => {
        const imageName = "test name";
        pageMocked.$.mockResolvedValueOnce(null);
        const elementHandle = await page.$("#test");

        await expect(
          playwrightVrt.trackElementHandle(elementHandle, imageName)
        ).rejects.toThrowError(new Error("ElementHandle is null"));
      });
    });
  });
});
