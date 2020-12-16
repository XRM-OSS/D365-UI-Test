# Startup
This tutorial is going to show you how to startup D365-UI-Test.

## Basics
Below snippet can be used in an init function of your test framework (e.g. "beforeAll" in jest):

```javascript
const xrmTest = new XrmUiTest();

let browser: playwright.Browser = undefined;
let context: playwright.BrowserContext = undefined;
let page: playwright.Page = undefined;

// Start the browser
// Pass headless: true for DevOps and when you don't want to see what playwright is doing.
// For debugging, setting headless: false is easier as you see what's happening
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

// When saving the settings file with the credentials directly in this directory, be sure to exclude it using .gitignore (or store it one folder above your working folder)
// Settings.txt might look like this:
// https://yourorg.crm4.dynamics.com,youruser@yourorg.onmicrosoft.com,yourpassword
const config = fs.readFileSync(path.resolve(__dirname, "settings.txt"), {encoding: "utf-8"});

// Easiest way to store credentials is to just separate url, username and password by comma in the file
const [url, user, password, mfaSecret] = config.split(",");

// Log into D365
await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
```

## D365 Online Organizations
Authentication with the default Microsoft D365 authentication provider is implemented by default. Nothing to take care of.

## Custom Auth Pages
When having a custom authentication page that you get redirected to on login, you have to provide D365-UI-Test with some additional information.

In some cases these authentication pages need the user name and the password, in some cases only the password is needed. The password is of course always needed.

The `xrmTest.open` function is able to use this information:

```javascript
const page = await xrmTest.open(url, { userName: user, password: password, passwordFieldSelector: "#password_input", userNameFieldSelector: "#userName_input" });
```

The values for passwordFieldSelector and userNameFieldSelector need to be valid CSS selectors that help D365-UI-Test finding the correct inputs for logging you in.
You can find them out using your browser's DOM developer tools. Usually they will have an ID set as above.

For sending this information the enter button will be pressed, no need to specify a login button selector.

## Multi Factor Auth (OTP)
Automatically generated OTP credentials are supported when using the default Microsoft Authenticator.

For doing this, register your Authenticator and when the QR code is displayed, click the button for the fallback option that states that you can't use a QR code.
Copy the secret.
You now just need to pass the secret as follows:

```javascript
// As in the non-mfa login example, settings.txt might look like
// https://yourorg.crm4.dynamics.com,youruser@yourorg.onmicrosoft.com,yourpassword,mfaSecret
const config = fs.readFileSync(path.resolve(__dirname, "settings.txt"), {encoding: "utf-8"});
const [url, user, password, mfaSecret] = config.split(",");

await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
```

> Important: If the OTP codes are not accepted, check that the system clock on your machine is completely synchronized. Even a slight offset to the global NTP servers might result in incorrect tokens. 
