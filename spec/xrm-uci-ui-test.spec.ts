import { XrmUiTest } from "../src";
import * as fs from "fs";
import * as playwright from "playwright";
import * as path from "path";
import { TestUtils } from "../src/utils/TestUtils";

const xrmTest = new XrmUiTest();
let browser: playwright.Browser = undefined;
let context: playwright.BrowserContext = undefined;
let page: playwright.Page = undefined;

describe("Basic operations UCI", () => {
    beforeAll(async() => {
        jest.setTimeout(60000);

        await xrmTest.launch("chromium", {
            headless: false,
            args: [
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--start-fullscreen",
                "--window-position=0,0",
                "--window-size=1920,1080",
                '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"'
            ]
        })
        .then(([b, c, p]) => {
            browser = b;
            context = c;
            page = p;
        });
    });

    test("It should log in", async () => {
        jest.setTimeout(120000);

        const settingsPath = path.join(__dirname, "../../settings.txt");
        const settingsFound = fs.existsSync(settingsPath);
        const config = settingsFound ? fs.readFileSync(settingsPath, {encoding: "utf-8"}) : `${process.env.CRM_URL ?? ""},${process.env.USER_NAME ?? ""},${process.env.USER_PASSWORD ?? ""},${process.env.MFA_SECRET ?? ""}`;
        const [url, user, password, mfaSecret] = config.split(",");

        await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
    });

    test("It should set string field", TestUtils.takeScreenShotOnFailure(() => page, path.resolve("reports", "dialogError.png"), async () => {
        jest.setTimeout(120000);

        await xrmTest.Navigation.openCreateForm("account");
        await xrmTest.Attribute.setValue("name", "Test name");

        await xrmTest.Entity.save(true);
        await xrmTest.Entity.delete();
    }));

    test("It should set option field", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        await xrmTest.Attribute.setValues({
            "address1_shippingmethodcode": 1
        });

        const value = await xrmTest.Attribute.getValue("address1_shippingmethodcode");
        expect(value).toBe(1);
    });

    test("It should survive navigation popup", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        await xrmTest.Attribute.setValues({
            "name": "Test name"
        });

        await xrmTest.Entity.save(true);
        await xrmTest.Attribute.setValue("name", "Updated");
        await xrmTest.Navigation.openCreateForm("account");
    });

    /*
    test("It should set quick create fields", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openQuickCreate("account");
        console.log("Form open");
        await xrmTest.Attribute.setValue("name", "Test name");
        await page.waitFor(50000);
        const value = await xrmTest.Attribute.getValue("name");
        expect(value).toBe("Test name");

        const id = await xrmTest.Entity.save();
    });
    */

    afterAll(() => {
        return xrmTest.close();
    });
});
