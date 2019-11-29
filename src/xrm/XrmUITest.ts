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

    get Navigation() {
        if (!this._navigation) {
            this._navigation = new Navigation(this._crmUrl, this._page);
        }

        return this._navigation;
    }

    get Button() {
        if (!this._button) {
            this._button = new Button(this._page);
        }

        return this._button;
    }

    get Entity() {
        if (!this._entity) {
            this._entity = new Entity(this._page);
        }

        return this._entity;
    }

    get Attribute() {
        if (!this._attribute) {
            this._attribute = new Attribute(this._page);
        }

        return this._attribute;
    }

    get Control() {
        if (!this._control) {
            this._control = new Control(this._page);
        }

        return this._control;
    }

    get Dialog() {
        if (!this._dialog) {
            this._dialog = new Dialog(this._page);
        }

        return this._dialog;
    }

    get Form() {
        if (!this._form) {
            this._form = new Form(this._page);
        }

        return this._form;
    }

    get SubGrid() {
        if (!this._subGrid) {
            this._subGrid = new SubGrid(this._page);
        }

        return this._subGrid;
    }

    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        // tslint:disable-next-line:no-null-keyword
        this._browser = await puppeteer.launch({ ...{ defaultViewport: null }, ...launchOptions });
        return this.browser;
    }

    open = async (url: string, extendedProperties?: { appId?: string; userName?: string; password?: string}) => {
        this._crmUrl = url;
        this._appId = extendedProperties && extendedProperties.appId;

        this._page = await this.browser.newPage();

        await this.page.goto(url, { waitUntil: "load" });
        await this.page.waitForNavigation({ waitUntil: "networkidle2" });

        if (extendedProperties && extendedProperties.userName && extendedProperties.password) {
            console.log(url);
            console.log(extendedProperties.userName);

            const userName = await this.page.waitForSelector("#i0116");
            await userName.type(extendedProperties.userName);

            await this.page.waitFor(1000);
            await userName.press("Enter");
            await this.page.waitFor(1000);

            let password = await this.page.$("#i0118");

            if (!password) {
                await this.page.waitForNavigation({ waitUntil: "networkidle0" });
                password = await this.page.$("#passwordInput");
            }

            password.type(extendedProperties.password);

            await this.page.waitFor(1000);
            await password.press("Enter");
            await this.page.waitFor(1000);

            const remember = await this.page.waitForSelector("#idBtn_Back");
            await remember.click();
            await this.page.waitFor(1000);

            await this.page.waitForNavigation({ waitUntil: "networkidle0" });
        }

        return this.page;
    }

    close = async () => {
        await this.browser.close();
    }
}