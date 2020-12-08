import * as playwright from "playwright";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 dialogs
 */
export class Dialog {
    private _page: playwright.Page;

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
            this._page.waitForTimeout(3000),
            this._page.waitForNavigation({ waitUntil: "networkidle" })
        ]);

        const confirmButton = await this._page.$("#butBegin") || await this._page.$("button[data-id='ignore_save']");

        if (confirmButton) {
            return Promise.all([
                confirmButton.click(),
                this._page.waitForNavigation({ waitUntil: "networkidle" })
            ]);
        }
    }
}