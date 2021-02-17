import { PortalUiTest } from "../src";
import { TestUtils } from "../src/utils/TestUtils";
import * as playwright from "playwright";
import * as fs from "fs";

const portalTest = new PortalUiTest();
let browser: playwright.Browser;
let context: playwright.BrowserContext;
let page: playwright.Page;

describe("Basic operations UCI", () => {
    beforeAll(async () => {
        jest.setTimeout(60000);

        await portalTest.launch("chromium", {
            headless: false,
            args: [
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--start-fullscreen',
                '--window-position=0,0',
                '--window-size=1920,1080',
                '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"'
            ]
        })
        .then(([b, c, p]) => {
            browser = b;
            context = c;
            page = p;
        });

        await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test("It should create email", TestUtils.takeScreenShotOnFailure(() => page, "./reports/emailTest.png", async () => {
        jest.setTimeout(60000);

        await page.goto("https://portal.microsoftportals.com/de-DE/");

        const link = await page.waitForSelector("a[href*='kontakt']");
        await link.click();

        const emailLink = await page.waitForSelector("a[href*='email']");
        await emailLink.click();

        await page.waitForSelector("#demo_firstname");
        await page.type("#demo_firstname", "UI Test Firstname");
        await page.type("#demo_lastname", "UI Test Lastname");

        await page.type("#emailaddress", "uitest@orbis.de");
        await page.type("#demo_street", "Planckstraße 10");
        await page.type("#demo_zippostalcode", "88677");
        await page.type("#demo_city", "Markdorf");
        await page.selectOption("#demo_countrycode", "100000085");
        await page.type("#title", "Automated UI Test");

        await page.type("#description", "UI Test Firstname");

        await page.evaluate(() => {
            (document.querySelector("#InsertButton") as any).click();
        });

        await page.waitForNavigation({ waitUntil: "networkidle" });

        const successDiv = await page.$(".alert-case-created");
        expect(successDiv).toBeDefined();
    }));

    afterAll(() => {
        return portalTest.close();
    });
});