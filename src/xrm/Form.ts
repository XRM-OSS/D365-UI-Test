import * as playwright from "playwright";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Scheme to describe a form reference
 * Either by name or by id
 */
export interface FormIdentifier {
    /**
     * The name of the form
     */
    byName?: string;

    /**
     * The id of the form
     */
    byId?: string;
}

/**
 * Module for interacting with D365 Forms
 */
export class Form {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Sets all attributes to submit mode none. This is useful if you don't want to save and just change the page. No prompt for unsaved data will open.
     * @returns Promise which resolves once all attribute submit modes are set
     * @deprecated Please use noSubmit
     */
    reset = async () => {
        return this.noSubmit();
    }

    /**
     * Sets all attributes to submit mode none. This is useful if you don't want to save and just change the page. No prompt for unsaved data will open.
     * @returns Promise which resolves once all attribute submit modes are set.
     */
    noSubmit = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            xrm.Page.getAttribute().forEach(a => a.setSubmitMode("never"));
        });
    }

    /**
     * Switches to the specified form
     * @param identifier Defines which form to switch to
     * @returns Promise which resolves once the selected form is loaded
     */
    switch = async (identifier: FormIdentifier) => {
        await EnsureXrmGetter(this._page);

        if (identifier.byId) {
            return Promise.all([
                this._page.evaluate((i) => {
                    const xrm = window.oss_FindXrm();

                    (xrm.Page.ui.formSelector.items.get(i) as any).navigate();
                }, identifier.byId),
                this._page.waitForNavigation({ waitUntil: "networkidle" })
            ]);
        }
        else if (identifier.byName) {
            return Promise.all([
                this._page.evaluate((i) => {
                    const xrm = window.oss_FindXrm();

                    (xrm.Page.ui.formSelector.items as any).getByFilter((f: any) => f._label === i).navigate();
                }, identifier.byName),
                this._page.waitForNavigation({ waitUntil: "networkidle" })
            ]);
        }
        else {
            throw new Error("Choose to search by id or name");
        }

    }
}