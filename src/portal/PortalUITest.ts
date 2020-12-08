import * as playwright from "playwright";

/**
 * Main class for testing in Portals
 */
export class PortalUiTest {
    private _browser: playwright.Browser;
    private _context: playwright.BrowserContext;
    private _page: playwright.Page;
    private _portalUrl: string;

    get browser() {
        return this._browser;
    }

    get context() {
        return this._context;
    }

    get page() {
        return this._page;
    }

    /**
     * Function for launching a playwright instance
     * @param {string} [browser] [chromium] Decide which browser to launch, options are chromium, firefox or webkit
     * @param {playwright.launchOptions} [launchOptions] Launch options for launching playwright. Will be used for calling playwright.launch.
     * @returns {playwright.Browser} Started browser instance
     * @remarks defaultViewport in launchOptions is preset to null for using your clients default resolution. Overwrite defaultViewport to change.
     */
    launch = async (browser: "chromium" | "firefox" | "webkit" = "chromium",
        launchOptions?: playwright.LaunchOptions,
        contextOptions?: playwright.BrowserContextOptions,
    ): Promise<[playwright.Browser, playwright.Page]> => {
        // tslint:disable-next-line:no-null-keyword
        this._browser = await playwright[browser].launch({ ...{ defaultViewport: null }, ...launchOptions });
        this._context = await this._browser.newContext(contextOptions);
        this._page = await this._browser.newPage();

        return [this.browser, this._page];
    }

    /**
     * Open the portals instance by url
     * @param {string} [url] Url of the portal you wish to open
     */
    open = async (url: string) => {
        this._portalUrl = url;

        await this.page.goto(`${this._portalUrl}`);
        await this.page.waitForNavigation({ waitUntil: "networkidle" });
    }

    /**
     * Log in as portal user
     * @param {string} user User name of the user to log in
     * @param {string} password Password of the user to log in
     */
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

    /**
     * Shut down
     */
    close = async () => {
        await this.browser.close();
    }
}