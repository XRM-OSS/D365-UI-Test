import { XrmUiTest } from "../src";
import * as fs from "fs";
import * as playwright from "playwright";
import * as path from "path";

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
    });

    test("It should log in", async () => {
        const settingsPath = path.join(__dirname, "../../settings.txt");
        const settingsFound = fs.existsSync(settingsPath);
        const config = settingsFound ? fs.readFileSync(settingsPath, {encoding: 'utf-8'}) : `${process.env.CRM_URL ?? ""},${process.env.USER_NAME ?? ""},${process.env.USER_PASSWORD ?? ""},${process.env.MFA_SECRET ?? ""}`;
        const [url, user, password, mfaSecret] = config.split(",");

        await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
    });

    test("It should set string field", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openCreateForm("account");
        await xrmTest.Form.noSubmit();

        await xrmTest.Attribute.setValue("name", "Test name");

        const value = await xrmTest.Attribute.getValue("name");
        expect(value).toBe("Test name");
    });

    test("It should set option field", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openCreateForm("account");
        await xrmTest.Form.noSubmit();

        await xrmTest.Attribute.setValue("address1_shippingmethodcode", 1);

        const value = await xrmTest.Attribute.getValue("address1_shippingmethodcode");
        expect(value).toBe(1);
    });

    test("It should set boolean field", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openCreateForm("account");
        await xrmTest.Form.noSubmit();

        await xrmTest.Attribute.setValue("creditonhold", true);

        const value = await xrmTest.Attribute.getValue("creditonhold");
        expect(value).toBe(true);
    });

    test("It should set money field", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openCreateForm("account");
        await xrmTest.Form.noSubmit();

        await xrmTest.Attribute.setValue("creditlimit", 123.12);

        const value = await xrmTest.Attribute.getValue("creditlimit");
        expect(value).toBe(123.12);
    });

    /*
    test("It should set lookup", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        const lookup = {entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.Attribute.setValue("oss_countryid", [lookup]);

        const [value] = await xrmTest.Attribute.getValue("oss_countryid");
        expect(value.id).toBe(lookup.id);
        expect(value.entityType).toBe(lookup.entityType);
        expect(value.name).toBe(lookup.name);

        await xrmTest.Entity.noSubmit();
    });

    test("It should create and delete record", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        await xrmTest.Attribute.setValue("name", "Test New Foo");

        const lookup = {entityType: "orb_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.Attribute.setValue("orb_countryid", [lookup]);

        await xrmTest.Entity.save();
        await xrmTest.Dialog.confirmDuplicateDetection();

        await xrmTest.Entity.delete();
    });

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
