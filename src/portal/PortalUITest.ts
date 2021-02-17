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
     *
     * @param {string} [browser] [chromium] Decide which browser to launch, options are chromium, firefox or webkit
     * @param {playwright.launchOptions} [launchOptions] Launch options for launching playwright. Will be used for calling playwright.launch.
     * @returns {Array<playwright.Browser, playwright.BrowserContext, playwright.Page} Started browser instance, browser context, page
     * @remarks viewport in contextOptions is preset to null for using your clients default resolution. Overwrite viewport to change.
     */
    launch = async (browser: "chromium" | "firefox" | "webkit" = "chromium",
        launchOptions?: playwright.LaunchOptions,
        contextOptions?: playwright.BrowserContextOptions,
    ): Promise<[playwright.Browser, playwright.BrowserContext, playwright.Page]> => {
        this._browser = await playwright[browser].launch(launchOptions);
        // tslint:disable-next-line:no-null-keyword
        this._context = await this._browser.newContext({ viewport: null, ...contextOptions });
        this._page = await this._context.newPage();

        return [this._browser, this._context, this._page];
    }

    /**
     * Open the portals instance by url
     *
     * @param {string} [url] Url of the portal you wish to open
     */
    open = async (url: string) => {
        this._portalUrl = url;

        await Promise.all([
            this.page.goto(`${this._portalUrl}`),
            this.page.waitForNavigation({ waitUntil: "networkidle" })
        ]);
    }

    /**
     * Log in as portal user
     *
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
