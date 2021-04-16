import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * State of a section
 */
export interface SectionState {
    /**
     * Whether the section is currently visible
     */
    isVisible: boolean;
}

/**
 * Module for interacting with D365 sections
 */
export class Section {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Gets the state of the specified section
     *
     * @param tabName Name of the parent tab of the section to retrieve
     * @param sectionName Name of the section to retrieve
     * @returns Promise which fulfills with the current section state
     */
    get = async (tabName: string, sectionName: string): Promise<SectionState> => {
        try {
            await EnsureXrmGetter(this._page);

            return this._page.evaluate(([tabName, sectionName]: [string, string]) => {
                const xrm = window.oss_FindXrm();
                const tab = xrm.Page.ui.tabs.get(tabName);
                const section = tab.sections.get(sectionName);

                return {
                    isVisible: section.getVisible() && tab.getVisible()
                };
            }, [tabName, sectionName]);
        }
        catch (e) {
            throw new RethrownError(`Error when getting section '${sectionName}'`, e);
        }
    }
}