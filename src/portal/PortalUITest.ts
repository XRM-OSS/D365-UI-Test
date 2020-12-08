import * as playwright from "playwright";

/**
 * Main class for testing in Portals
 */
export class PortalUiTest {
    private _browser: playwright.Browser;
    private _page: playwright.Page;
    private _portalUrl: string;

    get browser() {
        return this._browser;
    }

    get page() {
        return this._page;
    }

    launch = async (launchOptions?: playwright.LaunchOptions) => {
        const context = new playwright.con
        this._browser = await playwright.launch(launchOptions);
        return this.browser;
    }

    open = async (url: string, extendedProperties?: {}) => {
        this._portalUrl = url;

        await this.page.goto(`${this._portalUrl}`);
        await this.page.waitForNavigation({ waitUntil: "networkidle" });
    }

    login = async(userName: string, password: string) => {
        await this.page.goto(`${this._portalUrl}/signIn`);
        await this.page.waitForNavigation({ waitUntil: "networkidle" });

        const userNameField = await this.page.waitForSelector("#Username");
        await userNameField.type(userName);

        const passwordField = await this.page.waitForSelector("#Password");
        await passwordField.type(password);

        await this.page.keyboard.press("enter");

        await this.page.waitForNavigation({ waitUntil: "networkidle" });
    }

    close = async () => {
        await this.browser.close();
    }
}