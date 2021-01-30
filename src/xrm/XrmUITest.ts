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
import { D365Selectors } from "../domain/D365Selectors";
import { Section } from "./Section";

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
    private _section: Section;

    /**
     * Settings for D365-UI-Test behavior
     */
    private _settings: TestSettings = {
        /**
         * Default navigation timeout to use on operations
         *
         * @default 60000 (60 seconds)
         */
        timeout: 60 * 1000,

        /**
         * Default settle time to use for waiting until an idle page becomes settled
         * @default 2000 (2 seconds)
         */
        settleTime: 2 * 1000
    };

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
     * Gets the subfunctions for interacting with sections in D365, for example getting its visibility state
     */
    get Section() {
        if (!this._section) {
            this._section = new Section(this);
        }

        return this._section;
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
     *
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

    /**
     * Waits for all pending UCI operations to settle
     */
    waitForIdleness = async () => {
        // Wait for the page to become idle
        const firstIdlenessTime = await this.waitForIdlenessInternal();
        let secondIdlenessTime = firstIdlenessTime;

        this.logIfDebug(`Page became idle at: ${firstIdlenessTime}`);

        do {
            // Sleep some time
            await new Promise((resolve, reject) => setTimeout(resolve, 200));

            // Check the current idle state and remember the timestamp of this check
            const [isIdle, idleTime] = await this.checkIdlenessInternal();

            // If the page is still idle, we just set the latest time
            if (isIdle) {
                this.logIfDebug(`Page still idle at: ${secondIdlenessTime}`);
                secondIdlenessTime = idleTime;
            }
            // Otherwise the page was busy and we want to wait for the settle time again
            else {
                this.logIfDebug("Page became busy again, resetting first settle time");
                await this.waitForIdleness();
            }
        } while ((secondIdlenessTime - firstIdlenessTime) < this.settings.settleTime);

        this.logIfDebug(`Page has been idle for ${secondIdlenessTime - firstIdlenessTime} ms, resolving`);
    }

    /**
     * Opens your D365 organization and logs you in
     *
     * @param { String } url Url of your D365 organization
     * @param { Object } extendedProperties Options for logging in. User name and password are required. If you have a custom authentication page, you should pass userNameFieldSelector if user name has to be reentered and passwordFieldSelector for password entry. These are css selectors for the inputs.
     * @returns {void} Resolves as soon as D365 is logged in and open
     */
    open = async (url: string, extendedProperties: OpenProperties) => {
        this._crmUrl = url;
        this._appId = extendedProperties.appId;

        await Promise.all([
            this.page.goto(`${url}/main.aspx?forceUCI=1`, { waitUntil: "load", timeout: this.settings.timeout })
        ]);

        if (extendedProperties.userName) {
            await this.enterUserName(extendedProperties);
        }

        if (extendedProperties.password) {
            await this.enterPassword(extendedProperties);
        }

        if (extendedProperties.mfaSecret) {
            if (extendedProperties.mfaToggleFieldSelector) {
                const mfaToggle = await this.page.waitForSelector(extendedProperties.mfaToggleFieldSelector, { timeout: this.settings.timeout });
                await mfaToggle.click();
                await this.page.waitForTimeout(500);
            }

            const mfaInput = await this.page.waitForSelector(extendedProperties.mfaFieldSelector ?? D365Selectors.Login.otp);
            const token = speakeasy.totp({ secret: extendedProperties.mfaSecret, encoding: "base32" });

            await mfaInput.type(token);
            await this.page.waitForTimeout(500);
            await mfaInput.press("Enter");
        }

        const result = await Promise.race([
            this.page.waitForSelector(D365Selectors.Login.dontRememberLogin, { timeout: this.settings.timeout }),
            this.waitForIdleness()
        ]);
        
        if (this.isPageElement(result)) {
            await result.click();
            await this.waitForIdleness();
        }
    }

    /**
     * Closes the playwright browser session
     */
    close = async () => {
        await this.browser.close();
    }

    private logIfDebug (message: string) {
        this.settings.debugMode && console.log(message);
    }

    private async checkIdlenessInternal(): Promise<[boolean, number]> {
        const isIdle = await this._page.evaluate(
            () => (window as any).UCWorkBlockTracker && (window as any).UCWorkBlockTracker.isAppIdle(),
            []
        );

        return [isIdle, Date.now()];
    }

    private async waitForIdlenessInternal() {
        await this._page.waitForFunction(
            () => (window as any).UCWorkBlockTracker && (window as any).UCWorkBlockTracker.isAppIdle(),
            [],
            { timeout: this.settings.timeout, polling: 200 }
        );
        return Date.now();
    }

    private isPageElement(value: any): value is playwright.ElementHandle<SVGElement | HTMLElement> {
        return !!value && (value as playwright.ElementHandle<SVGElement | HTMLElement>).click !== undefined;
    }

    private async enterPassword(extendedProperties: OpenProperties): Promise<void> {
        const result = await Promise.race([
            this.page.waitForSelector(D365Selectors.Login.password, { timeout: this.settings.timeout }),
            this.page.waitForNavigation({ waitUntil: "load", timeout: this.settings.timeout })
        ]);

        // For non online authentification, wait for custom login page to settle
        if (!this.isPageElement(result)) {
            console.log(`No online auth, handling custom auth. If nothing happens, please specify passwordFieldSelector and optionally userNameFieldSelector.`);

            if (extendedProperties.userNameFieldSelector) {
                console.log("Waiting for user name field: " + extendedProperties.userNameFieldSelector);
                await this.page.fill(extendedProperties.userNameFieldSelector, extendedProperties.userName);
            }
            if (extendedProperties.passwordFieldSelector) {
                console.log("Waiting for password field: " + extendedProperties.passwordFieldSelector);
                await this.page.fill(extendedProperties.passwordFieldSelector, extendedProperties.password);
                await this.page.press(extendedProperties.passwordFieldSelector, "Enter");
            }
        }
        else {
            await result.fill(extendedProperties.password);
            await this.page.keyboard.press("Enter");
        }
    }

    private async enterUserName(extendedProperties: OpenProperties) {
        await this.page.fill(D365Selectors.Login.userName, extendedProperties.userName);
        await this.page.waitForTimeout(1000);
        await this.page.press(D365Selectors.Login.userName, "Enter");
        return this.page.waitForTimeout(1000);
    }
}
