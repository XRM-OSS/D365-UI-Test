import { XrmUiTest } from "../src/xrm-ui-test";

describe("Basic operations", () => {
    test("It should open CRM", async () => {
        const xrmTest = new XrmUiTest();
        
        const browser = await xrmTest.launch({
            headless: false
        });
        const page = await xrmTest.openCRM("https://org.crm.dynamics.com");

        await xrmTest.close();
    });
});