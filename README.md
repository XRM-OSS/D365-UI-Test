# D365-UI-Test
[![npm downloads](https://img.shields.io/npm/dt/d365-ui-test.svg)](http://npm-stats.com/~packages/d365-ui-test)

## What's this?
D365-UI-Test is an UI testing framework for easy and robust UI testing in Dynamics 365 CE and Dynamics 365 Portals.
It is powered by TypeScript and Puppeteer.
Various functions for interacting with CRM are implemented and can be used for executing your tests.

## What does a test look like?
D365-UI-Test is unopinionated, so we don't enforce a specific testing library.
The demo tests use [jest](https://jestjs.io/), but you could just as well use Mocha or someting completely different.

Jest Test:
```TypeScript
describe("Basic operations UCI", () => {
    // Login to CRM once for all tests in this module
    beforeAll(async() => {
        jest.setTimeout(60000);

        // You don't need to do it this way, but I did not want to check in the data by accident
        // The file in this example looks like this: https://org.crm4.dynamics.com,user@org.onmicrosoft.com,password
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

    afterAll(() => {
        return xrmTest.close();
    });
```

## Getting started
Install this project using npm to get started: `npm install d365-ui-test`.
Afterwards you can import it in your code like `import { XrmUiTest } from "d365-ui-test";`.
Use a testing framework such as Jest or Mocha for creating a test suite and set up a XrmUiTest instance in the startup step for launching a Chrome session.
Each of your tests can then be written inside the testing framework just as you're used to.

You might want to create your own settings.txt file as in the example above or just enter your credentials inline.
The demo tests reside at `spec/xrm-ui-test.spec.ts`, this might give you an idea.

## What's the difference to EasyRepro?
EasyRepro focuses on interacting with the form mainly by simulating user inputs.
When setting lookups, dealing with localization, renaming of labels and more topics, this seemed not the best option.
The CRM provides us with various global JS objects, which allow interacting with the system.
D365-UI-Test tries to use these JS objects (such as Xrm.Navigation) as much as possible, as this API is not expected to change unexpectedly, yields fast and stable results and causes no issues with localization.

D365-UI-Test also does not limit itself to Dynamics 365 CE, but also for testing connected Portals.

## Current limitations
There's a lot to do currently.

Opening create / update forms already works and you can set text / bool / number / currency / option set values.
Retrieving of values is also already possible.
In addition to that, you can assert control visibilities and disabled states.

Limitations:
- At the time of writing, retrieving of the Form contexts is only working in UCI. But supporting RUI as well is at the very top of the priority tasks.

## License
MIT licensed, have fun :)
