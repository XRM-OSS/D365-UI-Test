import * as puppeteer from "puppeteer";

export class PortalUiTest {
    private _browser: puppeteer.Browser;
    private _page: puppeteer.Page;
    private _portalUrl: string;

    get browser() {
        return this._browser;
    }

    get page() {
        return this._page;
    }

    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        this._browser = await puppeteer.launch(launchOptions);
        return this.browser;
    }

    open = async (url: string, extendedProperties?: {}) =>
    {
        this._portalUrl = url;

        await this.page.goto(`${this._portalUrl}`);
        await this.page.waitForNavigation({ waitUntil: "networkidle2" });
    }

    login = async(userName: string, password: string) => {
        await this.page.goto(`${this._portalUrl}/signIn`);
        await this.page.waitForNavigation({ waitUntil: "networkidle2" });

        const userNameField = await this.page.waitForSelector("#Username");
        await userNameField.type(userName);

        const passwordField = await this.page.waitForSelector("#Password");
        await passwordField.type(password);
        
        await this.page.keyboard.press("enter");

        await this.page.waitForNavigation({ waitUntil: "networkidle2" });
    }

    close = async () => {
        await this.browser.close();
    }
}