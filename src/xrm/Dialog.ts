import * as puppeteer from "puppeteer";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 dialogs
 */
export class Dialog {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Waits for the duplicate detection dialog and closes it
     * @returns Promise which resolves once duplicate detection has been closed
     */
    confirmDuplicateDetection = async() => {
        await Promise.race([
            this._page.waitFor(3000),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);

        const confirmButton = await this._page.$("#butBegin") || await this._page.$("button[data-id='ignore_save']");

        if (confirmButton) {
            return Promise.all([
                confirmButton.click(),
                this._page.waitForNavigation({ waitUntil: "networkidle0" })
            ]);
        }
    }
}