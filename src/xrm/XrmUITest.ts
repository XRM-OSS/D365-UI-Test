import * as puppeteer from "puppeteer";
import { Navigation } from "./Navigation";
import { Entity } from "./Entity";
import { Dialog } from "./Dialog";
import { Control } from "./Control";
import { Attribute } from "./Attribute";
import { SubGrid } from "./SubGrid";
import { Form } from "./Form";
import { Button } from "./Button";
import { Tab } from "./Tab";

/**
 * Main class for testing in D365
 */
export class XrmUiTest {
    private _browser: puppeteer.Browser;
    private _page: puppeteer.Page;
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

    /**
     * Gets the browser object that was generated when launching puppeteer
     */
    get browser() {
        return this._browser;
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
     * Function for launching a puppeteer instance
     * @param {puppeteer.launchOptions} [launchOptions] Launch options for launching puppeteer. Will be used for calling puppeteer.launch.
     * @returns {puppeteer.Browser} Started browser instance
     * @remarks defaultViewport in launchOptions is preset to null for using your clients default resolution. Overwrite defaultViewport to change.
     */
    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        // tslint:disable-next-line:no-null-keyword
        this._browser = await puppeteer.launch({ ...{ defaultViewport: null }, ...launchOptions });
        return this.browser;
    }

    private registerIgnoreUrls = async (page: puppeteer.Page) => {
        await page.setRequestInterception(true);

        // These URLs take sometimes more than 2 minutes to load, just abort them
        const ignoreUrlPaths = [
            "https://browser.pipe.aria.microsoft.com/Collector/3.0/?qsp=true&content-type=application%2Fbond-compact-binary&client-id=NO_AUTH",
            "https://dc.services.visualstudio.com/v2/track"
        ];

        page.on("request", req => {
            const requestUrl = req.url();

            if (ignoreUrlPaths.some(u => requestUrl.startsWith(u))) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    /**
     * @param { String } url Url of your D365 organization
     * @param { Object } extendedProperties Options for logging in. User name and password are required. If you have a custom authentication page, you should pass userNameFieldSelector if user name has to be reentered and passwordFieldSelector for password entry. These are css selectors for the inputs.
     * @returns {puppeteer.Page} The page in which D365 was opened
     */
    open = async (url: string, extendedProperties: { appId?: string; userName: string; password: string, userNameFieldSelector?: string; passwordFieldSelector?: string }) => {
        this._crmUrl = url;
        this._appId = extendedProperties.appId;

        this._page = await this.browser.newPage();

        // Work around issues with linux user agents
        this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/60.0.3112.78 Safari/537.36");

        // Register ignore URLs that sometimes cause trouble with timeouts
        await this.registerIgnoreUrls(this.page);

        await Promise.all([
            this.page.goto(url, { waitUntil: "load" }),
            this.page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);

        await this.enterUserName(extendedProperties);
        await this.enterPassword(extendedProperties);
        await this.dontRememberLogin();

        return this.page;
    }

    /**
     * @param { String } url Url of your on premise D365 organization. For now, single sign on is expected.
     * @param { Object } extendedProperties Options for logging in. User name and password are required. If you have a custom authentication page, you should pass userNameFieldSelector if user name has to be reentered and passwordFieldSelector for password entry. These are css selectors for the inputs.
     * @returns {puppeteer.Page} The page in which D365 was opened
     */
    openOnPremise = async (url: string, extendedProperties: { appId?: string; }) => {
        this._crmUrl = url;
        this._appId = extendedProperties.appId;

        this._page = await this.browser.newPage();

        // Work around issues with linux user agents
        this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/60.0.3112.78 Safari/537.36");

        // Register ignore URLs that sometimes cause trouble with timeouts
        await this.registerIgnoreUrls(this.page);

        await Promise.all([
            this.page.goto(url, { waitUntil: "load" }),
            this.page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);

        await Promise.race([this.page.waitFor("#TabAppSwitcherNode"), this.page.waitFor("button[data-id='officewaffle']")]);

        return this.page;
    }

    /**
     * Closes the puppeteer browser session
     */
    close = async () => {
        await this.browser.close();
    }

    private async dontRememberLogin() {
        const remember = await this.page.waitForSelector("#idBtn_Back");
        await remember.click();
        return Promise.race([this.page.waitFor("#TabAppSwitcherNode"), this.page.waitFor("button[data-id='officewaffle']")]);
    }

    private async enterPassword(extendedProperties: { appId?: string; userName: string; password: string; userNameFieldSelector?: string; passwordFieldSelector?: string; }) {
        const password = await this.page.$("#i0118");
        // For non online authentification, wait for custom login page to settle
        if (!password) {
            await this.page.waitForNavigation({ waitUntil: "load" });
            console.log(`No online auth, handling custom auth. If nothing happens, please specify passwordFieldSelector and optionally userNameFieldSelector.`);
            if (extendedProperties.userNameFieldSelector) {
                console.log("Waiting for user name field: " + extendedProperties.userNameFieldSelector);
                const userNameField = await this.page.waitFor(extendedProperties.userNameFieldSelector);
                await userNameField.type(extendedProperties.userName);
            }
            if (extendedProperties.passwordFieldSelector) {
                console.log("Waiting for password field: " + extendedProperties.passwordFieldSelector);
                const passwordInput = await this.page.waitFor(extendedProperties.passwordFieldSelector);
                await passwordInput.type(extendedProperties.password);
                return passwordInput.press("Enter");
            }
        }
        else {
            // For some reason we need the else in here, without it errors will occur
            await password.type(extendedProperties.password);
            return password.press("Enter");
        }
    }

    private async enterUserName(extendedProperties: { appId?: string; userName: string; password: string; userNameFieldSelector?: string; passwordFieldSelector?: string; }) {
        const userName = await this.page.waitForSelector("#i0116");
        await userName.type(extendedProperties.userName);
        await this.page.waitFor(1000);
        await userName.press("Enter");
        return this.page.waitFor(1000);
    }
}