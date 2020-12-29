import * as playwright from "playwright";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * State of a tab
 */
export interface TabState {
    /**
     * Whether the tab is currently visible
     */
    isVisible: boolean;
}

/**
 * Module for interacting with D365 Tabs
 */
export class Tab {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Opens the specified tab on the form
     *
     * @param tabName Name of the tab to open
     * @returns Promise which fulfills with the current control state
     */
    open = async (tabName: string) => {
        await EnsureXrmGetter(this._page);

        await this._page.evaluate((tabName: string) => {
            const xrm = window.oss_FindXrm();

            xrm.Page.ui.tabs.get(tabName).setDisplayState("expanded");
        }, tabName);

        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Gets the state of the specified tab
     *
     * @param name Name of the tab to retrieve
     * @returns Promise which fulfills with the current tab state
     */
    get = async (name: string): Promise<TabState> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((tabName: string) => {
            const xrm = window.oss_FindXrm();
            const tab = xrm.Page.ui.tabs.get(tabName);

            return {
                isVisible: tab.getVisible()
            };
        }, name);
    }
}