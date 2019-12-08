import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 Tabs
 */
export class Tab {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Opens the specified tab on the form
     * @param tabName Name of the tab to open
     * @returns Promise which fulfills with the current control state
     */
    open = async (tabName: string) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((tabName: string) => {
            const xrm = window.oss_FindXrm();

            xrm.Page.ui.tabs.get(tabName).setDisplayState("expanded");
        }, tabName);
    }
}