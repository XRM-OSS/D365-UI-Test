import { XrmUiTest } from "../src/xrm-ui-test";
import * as fs from "fs";
import * as puppeteer from "puppeteer";

const xrmTest = new XrmUiTest();
let browser: puppeteer.Browser = null;
let page: puppeteer.Page = null;

describe("Basic operations UCI", () => {
    beforeAll(async() => {
        jest.setTimeout(60000);

        const config = fs.readFileSync("C:/temp/settings.txt", {encoding: 'utf-8'});
        const [url, user, password] = config.split(",");

        browser = await xrmTest.launch({
            headless: false,
            args: ['--start-fullscreen'],
            defaultViewport: null
        });

        page = await xrmTest.open(url, { userName: user, password: password });
        
        await xrmTest.openAppById("3cd81e96-2940-e811-a952-000d3ab20edc");
    });

    test("It should set string field", async () => {
        jest.setTimeout(60000);
        
        await xrmTest.openCreateForm("account");

        await xrmTest.setAttributeValue("name", "Test name");

        const value = await xrmTest.getAttributeValue("name");
        expect(value).toBe("Test name");

        await xrmTest.reset();
    });

    test("It should set option field", async () => {
        jest.setTimeout(60000);
        await xrmTest.openCreateForm("account");

        await xrmTest.setAttributeValue("customertypecode", 3);

        const value = await xrmTest.getAttributeValue("customertypecode");
        expect(value).toBe(3);

        await xrmTest.reset();
    });
    
    test("It should set boolean field", async () => {
        jest.setTimeout(60000);
        await xrmTest.openCreateForm("account");

        await xrmTest.setAttributeValue("msdyn_taxexempt", true);

        const value = await xrmTest.getAttributeValue("msdyn_taxexempt");
        expect(value).toBe(true);

        await xrmTest.reset();
    });

    test("It should set money field", async () => {
        jest.setTimeout(60000);
        await xrmTest.openCreateForm("account");

        await xrmTest.setAttributeValue("creditlimit", 123.12);

        const value = await xrmTest.getAttributeValue("creditlimit");
        expect(value).toBe(123.12);

        await xrmTest.reset();
    });

    test("It should set lookup", async () => {
        jest.setTimeout(60000);
        await xrmTest.openCreateForm("account");

        const lookup = {entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.setAttributeValue("oss_countryid", [lookup]);

        const [value] = await xrmTest.getAttributeValue("oss_countryid");
        expect(value.id).toBe(lookup.id);
        expect(value.entityType).toBe(lookup.entityType);
        expect(value.name).toBe(lookup.name);

        await xrmTest.reset();
    });

    test("It should create and delete record", async () => {
        jest.setTimeout(60000);
        await xrmTest.openCreateForm("account");

        await xrmTest.setAttributeValue("name", "Test New Foo");

        const lookup = {entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.setAttributeValue("oss_countryid", [lookup]);

        await xrmTest.save();
        await xrmTest.confirmDuplicateDetection();

        await xrmTest.delete();
    });    

    afterAll(() => {
        return xrmTest.close();
    });
});