# Startup
This tutorial is going to show you how to startup D365-UI-Test.

## Basics
Below snippet can be used in an init function of your test framework (e.g. "beforeAll" in jest):

```javascript
// When saving the settings file with the credentials directly in this directory, be sure to exclude it using .gitignore (or store it one folder above your working folder)
const config = fs.readFileSync(path.resolve(__dirname, "settings.txt"), {encoding: "utf-8"});
// Easiest way to store credentials is to just separate url, username and password by comma in the file
const [url, user, password] = config.split(",");

// Pass headless: true for DevOps and when you don't want to see what playwright is doing.
// For debugging, setting headless: false is easier as you see what's happening
const browser = await xrmTest.launch({
    headless: false,
    args: [
        "--start-fullscreen"
    ]
});

// You will probably want to declare the page variable in outer scope as you might need to access it for implementing your own interactions with playwright.
const page = await xrmTest.open(url, { userName: user, password: password });
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
const [url, user, password, mfaSecret] = config.split(",");

await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
```

> Important: If the OTP codes are not accepted, check that the system clock on your machine is completely synchronized. Even a slight offset to the global NTP servers might result in incorrect tokens. 
