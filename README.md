# D365-UI-Test [![CI](https://github.com/XRM-OSS/D365-UI-Test/actions/workflows/main.yml/badge.svg)](https://github.com/XRM-OSS/D365-UI-Test/actions/workflows/main.yml) [![Known Vulnerabilities](https://snyk.io/test/github/digitalflow/d365-ui-test/badge.svg)](https://snyk.io/test/github/digitalflow/d365-ui-test) [![npm downloads](https://img.shields.io/npm/dt/d365-ui-test.svg)](http://npm-stats.org/#/d365-ui-test)

## What's this?
D365-UI-Test is an UI testing framework for easy and robust UI testing in Dynamics 365 CE and Dynamics 365 Portals.
It is powered by TypeScript and playwright. You can write your tests in plain JS or in TypeScript.
Various functions for interacting with CRM are implemented and can be used for executing your tests.

## Quick Showcase
https://user-images.githubusercontent.com/4287938/103551344-818f6f80-4eaa-11eb-8e77-db6e6ceb71be.mp4

## What does a test look like?
D365-UI-Test is unopinionated, so we don't enforce a specific testing library.
The demo tests use [jest](https://jestjs.io/), but you could just as well use Mocha or someting completely different.

Jest Test:
```TypeScript
describe("Basic operations UCI", () => {
    beforeAll(async () => {
        jest.setTimeout(60000);

        await xrmTest.launch("chromium", {
            headless: false,
            args: ["--start-fullscreen"]
        })
        .then(([b, c, p]) => {
            browser = b;
            context = c;
            page = p;
        });
    });

    test("Start D365", async () => {
        const config = fs.readFileSync(path.join(__dirname, "../../settings.txt"), {encoding: 'utf-8'});
        const [url, user, password] = config.split(",");
    });

    test("Open new account form", async () => {
        await xrmTest.Navigation.openCreateForm("account");
    });

    afterAll(() => {
        return xrmTest.close();
    });
});
```

## Getting started
### Writing tests
Thera are demo projects for getting started with various test frameworks:
- Jest: https://github.com/DigitalFlow/D365-UI-Test-Jest-Demo
- Mocha / Chai: https://github.com/paulbreuler/D365-UI-Mocha-Test (Thanks Paul!)

Just follow the instructions in there for getting started.

### Designing test using D365-UI-Test-Designer
There is an official browser extension for Google Chrome and MS Edge available here: https://github.com/XRM-OSS/D365-UI-Test-Designer
It can help you to record form actions as UI tests and to assist you in defining tests.

### Without template project
Install this project using npm to get started: `npm install d365-ui-test`.

Afterwards you can import it in your code like `import { XrmUiTest } from "d365-ui-test";`.

Use a testing framework such as Jest or Mocha for creating a test suite and set up a XrmUiTest instance in the startup step for launching a Chrome session.
Each of your tests can then be written inside the testing framework just as you're used to.

You might want to create your own settings.txt file as in the example above or just enter your credentials inline.
The demo tests reside at `spec/xrm-ui-test.spec.ts`, the demo project can be found in the previous section.
This might give you an idea.

## What's the difference to EasyRepro?
EasyRepro focuses on interacting with the form mainly by simulating user inputs.
When setting lookups, dealing with localization, renaming of labels and more topics, this seemed not the best option.
The CRM provides us with various global JS objects, which allow interacting with the system.
D365-UI-Test tries to use these JS objects (such as Xrm.Navigation) as much as possible, as this API is not expected to change unexpectedly, yields fast and stable results and causes no issues with localization.

D365-UI-Test also does not limit itself to Dynamics 365 CE, but also for testing connected Portals.

## Continuous Integration
D365-UI-Test is cross platform. You can run it on Windows, Linux, Mac and of course also on Azure or any other CI platform.
For getting started as fast as possible, there is a fully functioning predefined yaml pipeline definition for Azure DevOps available in the documentation: https://xrm-oss.github.io/D365-UI-Test/pages/Tutorials/10_DevOps.html

## Current Feature Set
- Open and log in to D365 (MS OTP tokens / two factor auth is also supported)
- Open an App
- Open Create / Update Forms
- Set values for all CRM field types
- Get values of all CRM field types
- Get visibility and readonly state for controls
- Get subgrid record count, refresh subgrid, open n-th record of subgrid
- Click ribbon Buttons
- Download files
- Runs on Windows, Linux, Mac (also on DevOps)
