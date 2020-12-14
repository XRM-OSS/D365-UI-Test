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
}