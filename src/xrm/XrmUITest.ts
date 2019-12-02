import * as puppeteer from "puppeteer";
import { Navigation } from "./Navigation";
import { Entity } from "./Entity";
import { Dialog } from "./Dialog";
import { Control } from "./Control";
import { Attribute } from "./Attribute";
import { SubGrid } from "./SubGrid";
import { Form } from "./Form";
import { Button } from "./Button";

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

    get browser() {
        return this._browser;
    }

    get page() {
        return this._page;
    }

    get crmUrl() {
        return this._crmUrl;
    }

    get Navigation() {
        if (!this._navigation) {
            this._navigation = new Navigation(this);
        }

        return this._navigation;
    }

    get Button() {
        if (!this._button) {
            this._button = new Button(this);
        }

        return this._button;
    }

    get Entity() {
        if (!this._entity) {
            this._entity = new Entity(this);
        }

        return this._entity;
    }

    get Attribute() {
        if (!this._attribute) {
            this._attribute = new Attribute(this);
        }

        return this._attribute;
    }

    get Control() {
        if (!this._control) {
            this._control = new Control(this);
        }

        return this._control;
    }

    get Dialog() {
        if (!this._dialog) {
            this._dialog = new Dialog(this);
        }

        return this._dialog;
    }

    get Form() {
        if (!this._form) {
            this._form = new Form(this);
        }

        return this._form;
    }

    get SubGrid() {
        if (!this._subGrid) {
            this._subGrid = new SubGrid(this);
        }

        return this._subGrid;
    }

    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        // tslint:disable-next-line:no-null-keyword
        this._browser = await puppeteer.launch({ ...{ defaultViewport: null }, ...launchOptions });
        return this.browser;
    }

    /**
     * @param { String } url Url of your D365 organization
     * @param { Object } extendedProperties Options for logging in. User name and password are required. If you have a custom authentication page, you should pass userNameFieldSelector if user name has to be reentered and passwordFieldSelector for password entry. These are css selectors for the inputs.
     */
    open = async (url: string, extendedProperties: { appId?: string; userName: string; password: string, userNameFieldSelector?: string; passwordFieldSelector?: string }) => {
        this._crmUrl = url;
        this._appId = extendedProperties.appId;

        this._page = await this.browser.newPage();

        // Work around issues with linux user agents
        this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/60.0.3112.78 Safari/537.36");

        await Promise.all([
            this.page.goto(url, { waitUntil: "load" }),
            this.page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);

        const userName = await this.page.waitForSelector("#i0116");
        await userName.type(extendedProperties.userName);

        await this.page.waitFor(1000);
        await userName.press("Enter");
        await this.page.waitFor(1000);

        const password = await this.page.$("#i0118");

        // For non online authentification, wait for custom login page to settle
        if (!password) {
            await this.page.waitForNavigation({ waitUntil: "networkidle0" });
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
                await passwordInput.press("Enter");
            }
        }
        else {
            // For some reason we need the else in here, without it errors will occur
            await password.type(extendedProperties.password);
            await password.press("Enter");
        }

        const remember = await this.page.waitForSelector("#idBtn_Back");

        await Promise.all([
            this.page.waitForNavigation({ waitUntil: "networkidle0" }),
            this.page.waitForNavigation({ waitUntil: "load" }),
            remember.click()
        ]);

        return this.page;
    }

    close = async () => {
        await this.browser.close();
    }
}