import * as playwright from "playwright";
import { Navigation } from "./Navigation";
import { Entity } from "./Entity";
import { Dialog } from "./Dialog";
import { Control } from "./Control";
import { Attribute } from "./Attribute";
import { SubGrid } from "./SubGrid";
import { Form } from "./Form";
import { Button } from "./Button";
import { Tab } from "./Tab";
import { TestSettings } from "../domain/TestSettings";
import * as speakeasy from "speakeasy";

/**
 * Parameters for opening Dynamics
 */
export interface OpenProperties {
    /**
     * ID of the Dynamics app to open after login
     */
    appId?: string;

    /**
     * Username / email to use for logging in. If left out, it is assumed that CRM does not need explicit authentication (i.e. SSO)
     */
    userName?: string;

    /**
     * Password to use for logging in. If left out, SSO is assumed.
     */
    password?: string;

    /**
     * CSS selector for typing user name / email on login page. Needed for custom authentication pages of ADFS only.
     */
    userNameFieldSelector?: string;

    /**
     * CSS selector for typing password on login page. Needed for custom authentication pages of ADFS only.
     */
    passwordFieldSelector?: string;

    /**
     * Secret which you generated for using MFA. Only needed if you actually use MFA
     */
    mfaSecret?: string;

    /**
     * Enter css selector for mfaInput, if you use a non MS default MFA provider. If none provided, we will try finding the MS token input
     */
    mfaFieldSelector?: string;

    /**
     * If you use a non MS MFA provider and need to switch a toggle first before being able to insert token, specify the toggle field selector that has to be clicked before entering the MFA token here
     */
    mfaToggleFieldSelector?: string;
}

/**
 * Main class for testing in D365
 */
export class XrmUiTest {
    private _browser: playwright.Browser;
    private _context: playwright.BrowserContext;

    private _page: playwright.Page;
    private _crmUrl: string;
    private _appId: string;

    private _navigation: Navigation;
    private _entity: Entity;
    private _dialog: Dialog;
    private _control: Control;
    private _attribute: Attribute;
    private _form: Form;
    private _subGrid: SubGrid;
    private _button: Button;
    private _tab: Tab;

    private _settings: TestSettings = {
        // Default navigation timeout is 60 seconds
        timeout: 60 * 1000
    };

    private rememberButtonId = "#idBtn_Back";

    /**
     * Default settings for various actions such as navigation
     */
    get settings() {
        return this._settings;
    }

    /**
     * Update settings
     */
    set settings(value: TestSettings) {
        this._settings = { ...this._settings, ...value };
    }

    /**
     * Gets the browser object that was generated when launching playwright
     */
    get browser() {
        return this._browser;
    }

    /**
     * Gets the browser context object
     */
    get context() {
        return this._context;
    }

    /**
     * Gets the page object that was generated when connecting to D365
     */
    get page() {
        return this._page;
    }

    /**
     * Gets the D365 base URL
     */
    get crmUrl() {
        return this._crmUrl;
    }

    /**
     * Gets the subfunctions for navigating in D365
     */
    get Navigation() {
        if (!this._navigation) {
            this._navigation = new Navigation(this);
        }

        return this._navigation;
    }

    /**
     * Gets the subfunctions for using ribbon buttons in D365
     */
    get Button() {
        if (!this._button) {
            this._button = new Button(this);
        }

        return this._button;
    }

    /**
     * Gets the subfunctions for interacting with the record in D365
     */
    get Entity() {
        if (!this._entity) {
            this._entity = new Entity(this);
        }

        return this._entity;
    }

    /**
     * Gets the subfunctions for interacting with attributes in D365, for example getting or setting values
     */
    get Attribute() {
        if (!this._attribute) {
            this._attribute = new Attribute(this);
        }

        return this._attribute;
    }

    /**
     * Gets the subfunctions for interacting with controls in D365, for example getting visibility or disable states
     */
    get Control() {
        if (!this._control) {
            this._control = new Control(this);
        }

        return this._control;
    }

    /**
     * Gets the subfunctions for interacting with dialogs in D365, for example duplicate detection dialogs
     */
    get Dialog() {
        if (!this._dialog) {
            this._dialog = new Dialog(this);
        }

        return this._dialog;
    }

    /**
     * Gets the subfunctions for interacting with forms in D365, for example opening different forms
     */
    get Form() {
        if (!this._form) {
            this._form = new Form(this);
        }

        return this._form;
    }

    /**
     * Gets the subfunctions for interacting with subgrids in D365, for example refreshing or opening specific records
     */
    get SubGrid() {
        if (!this._subGrid) {
            this._subGrid = new SubGrid(this);
        }

        return this._subGrid;
    }

    /**
     * Gets the subfunctions for interacting with tabs in D365, for example to open one
     */
    get Tab() {
        if (!this._tab) {
            this._tab = new Tab(this);
        }

        return this._tab;
    }

    /**
     * Gets the currently opened AppId
     */
    get AppId() {
        return this._appId;
    }

    /**
     * Sets the currently opened AppId. Is set automatically by calling Navigation.openAppById
     */
    set AppId(value) {
        this._appId = value;
    }

    /**
     * Function for launching a playwright instance
     * @param {string} [browser] [chromium] Decide which browser to launch, options are chromium, firefox or webkit
     * @param {playwright.launchOptions} [launchOptions] Launch options for launching playwright. Will be used for calling playwright.launch.
     * @returns {Array<playwright.Browser, playwright.BrowserContext, playwright.Page>} Started browser instance, browser context and page
     * @remarks viewport in launchOptions is preset to null for using your clients default resolution. Overwrite viewport to change.
     */
    launch = async (browser: "chromium" | "firefox" | "webkit" = "chromium",
        launchOptions?: playwright.LaunchOptions,
        contextOptions?: playwright.BrowserContextOptions,
    ): Promise<[playwright.Browser, playwright.BrowserContext, playwright.Page]> => {
        this._browser = await playwright[browser].launch(launchOptions);
        // tslint:disable-next-line:no-null-keyword
        this._context = await this._browser.newContext({ viewport: null, ...contextOptions });
        this._page = await this._context.newPage();

        return [this.browser, this._context, this._page];
    }

    private registerIgnoreUrls = async (page: playwright.Page) => {
        // These URLs take sometimes more than 2 minutes to load, just abort them
        const ignoreUrlPaths = [
            "https://browser.pipe.aria.microsoft.com/Collector/3.0/?qsp=true&content-type=application%2Fbond-compact-binary&client-id=NO_AUTH",
            "https://dc.services.visualstudio.com/v2/track",
            "https://graph.windows.net/me?api-version=",
            "https://loki.delve.office.com/api/v1/configuration/Dynamics365UCI/"
        ];

        page.route("**", route => {
            const url = route.request().url();

            if (ignoreUrlPaths.some(ignoreUrl => ignoreUrl.startsWith(url))) {
                route.abort();
            }
            else {
                route.continue();
            }
        });
    }

    /**
     * Waits for all pending UCI operations to settle
     */
    waitForIdleness = async () => {
        await this._page.waitForFunction(() => (window as any).UCWorkBlockTracker && (window as any).UCWorkBlockTracker.isAppIdle(), { timeout: this.settings.timeout });
    }

    /**
     * Opens your D365 organization and logs you in
     * @param { String } url Url of your D365 organization
     * @param { Object } extendedProperties Options for logging in. User name and password are required. If you have a custom authentication page, you should pass userNameFieldSelector if user name has to be reentered and passwordFieldSelector for password entry. These are css selectors for the inputs.
     * @returns {void} Resolves as soon as D365 is logged in and open
     */
    open = async (url: string, extendedProperties: OpenProperties) => {
        this._crmUrl = url;
        this._appId = extendedProperties.appId;

        // Register ignore URLs that sometimes cause trouble with timeouts
        await this.registerIgnoreUrls(this.page);

        await Promise.all([
            this.page.goto(url, { waitUntil: "load", timeout: this.settings.timeout }),
            this.page.waitForNavigation({ waitUntil: "networkidle", timeout: this.settings.timeout })
        ]);

        if (extendedProperties.userName) {
            await this.enterUserName(extendedProperties);
        }

        if (extendedProperties.password) {
            const handleRememberLogin = await this.enterPassword(extendedProperties);

            if (handleRememberLogin && !extendedProperties.mfaSecret) {
                await this.dontRememberLogin();
            }
        }

        if (extendedProperties.mfaSecret) {
            if (extendedProperties.mfaToggleFieldSelector) {
                const mfaToggle = await this.page.waitForSelector(extendedProperties.mfaToggleFieldSelector, { timeout: this.settings.timeout });
                await mfaToggle.click();
                await this.page.waitForTimeout(500);
            }

            const mfaInput = await this.page.waitForSelector(extendedProperties.mfaFieldSelector ?? "#idTxtBx_SAOTCC_OTC");
            const token = speakeasy.totp({ secret: extendedProperties.mfaSecret, encoding: "base32" });

            await mfaInput.type(token);
            await this.page.waitForTimeout(500);
            await mfaInput.press("Enter");

            await this.dontRememberLogin();
        }

        await Promise.race([
            this.page.waitForSelector("button[data-id='officewaffleplaceholder']", { timeout: this.settings.timeout }),
            this.page.waitForSelector("#TabAppSwitcherNode", { timeout: this.settings.timeout }),
            this.page.waitForSelector("#O365_MainLink_NavMenu", { timeout: this.settings.timeout }),
            this.page.waitForSelector("button[data-id='officewaffle']", { timeout: this.settings.timeout }),
            this.page.waitForSelector("#navTabAppSwitcherImage_TabAppSwitcherNode", { timeout: this.settings.timeout }),
        ]);

        await this.waitForIdleness();
    }

    /**
     * Closes the playwright browser session
     */
    close = async () => {
        await this.browser.close();
    }

    private async dontRememberLogin() {
        const remember = await this.page.waitForSelector(this.rememberButtonId, { timeout: this.settings.timeout });
        return remember.click();
    }

    private async enterPassword(extendedProperties: OpenProperties) {
        const password = await this.page.$("#i0118");
        // For non online authentification, wait for custom login page to settle
        if (!password) {
            await this.page.waitForNavigation({ waitUntil: "load" });

            console.log(`No online auth, handling custom auth. If nothing happens, please specify passwordFieldSelector and optionally userNameFieldSelector.`);

            if (extendedProperties.userNameFieldSelector) {
                console.log("Waiting for user name field: " + extendedProperties.userNameFieldSelector);
                await this.page.fill(extendedProperties.userNameFieldSelector, extendedProperties.userName);
            }
            if (extendedProperties.passwordFieldSelector) {
                console.log("Waiting for password field: " + extendedProperties.passwordFieldSelector);
                await this.page.fill(extendedProperties.passwordFieldSelector, extendedProperties.password);

                await this.page.press(extendedProperties.passwordFieldSelector, "Enter");

                return true;
            }
        }
        else {
            // For some reason we need the else in here, without it errors will occur
            await password.fill(extendedProperties.password);
            await this.page.keyboard.press("Enter");
            return true;
        }

        return false;
    }

    private async enterUserName(extendedProperties: OpenProperties) {
        const userName = await this.page.waitForSelector("#i0116");
        await userName.type(extendedProperties.userName);
        await this.page.waitForTimeout(1000);
        await userName.press("Enter");
        return this.page.waitForTimeout(1000);
    }
}
