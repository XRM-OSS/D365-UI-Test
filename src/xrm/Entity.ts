import * as playwright from "playwright";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 entity records
 */
export class Entity {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Sets all attributes to submit mode none. This is useful if you don't want to save and just change the page. No prompt for unsaved data will open.
     *
     * @returns Promise which resolves once all attribute submit modes are set
     * @deprecated Use Form.noSubmit instead
     */
    noSubmit = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            const attributes = xrm.Page.getAttribute();

            attributes.forEach(a => a.setSubmitMode("never"));
        });
    }

    /**
     * Saves the record and returns the ID (both for quick create and "normal" create)
     *
     * @param ignoreDuplicateCheck [false] Whether to automatically ignore duplicate check warnings
     * @returns The id of the record
     */
    save = async (ignoreDuplicateCheck = false) => {
        await EnsureXrmGetter(this._page);

        const waitSelectors = [
            // This is the id of the notification that gets shown once a quick create record is saved
            this._page.waitForSelector("div[id^=quickcreate_]", { timeout: this.xrmUiTest.settings.timeout })
        ];

        const saveResult = this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.save();
        });

        await Promise.race([
            ...waitSelectors,
            // Normal page should switch to idle again
            this.xrmUiTest.waitForIdleness(),
            // Wait for duplicate dialog
            this._page.waitForSelector('button[data-id="ignore_save"]', { timeout: this.xrmUiTest.settings.timeout })
        ]);

        const duplicateCheckButton = await this._page.$('button[data-id="ignore_save"]');

        if (duplicateCheckButton) {
            if (ignoreDuplicateCheck) {
                await Promise.all([duplicateCheckButton.click(), saveResult, Promise.race([...waitSelectors, this.xrmUiTest.waitForIdleness()])]);
            }
            else {
                await this._page.click('button[data-id="close_dialog"]');
                throw new Error("Duplicate records found. Pass true for save parameter 'ignoreDuplicateCheck' for ignore and saving");
            }
        }

        const quickCreate = await this._page.$("div[id^=quickcreate_]");

        if (quickCreate) {
            const handle = await quickCreate.getProperty("id");
            const id: string = await handle.jsonValue();

            return id.substr(12);
        }

        return this.getId();
    }

    /**
     * Get the id of the currently opened record
     *
     * @returns Promise which resolves with the id
     */
    getId = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getId();
        });
    }

    /**
     * Get the name of the currently opened record
     *
     * @returns Promise which resolves with the name
     */
    getEntityName = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getEntityName();
        });
    }

    /**
     * Get the entity reference of the currently opened record
     *
     * @returns Promise which resolves with the entity reference
     */
    getEntityReference = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getEntityReference();
        });
    }

    /**
     * Delete the current record
     *
     * @returns Promise which resolves once deletion is done
     * @remarks Delete button on form will be used
     */
    delete = async() => {
        this.xrmUiTest.Button.click({ custom: "li[id*='DeletePrimaryRecord']" });

        const confirmButton = await Promise.race([ this._page.waitForSelector("#butBegin", { timeout: this.xrmUiTest.settings.timeout }), this._page.waitForSelector("#confirmButton", { timeout: this.xrmUiTest.settings.timeout })]);

        if (confirmButton) {
            return Promise.all([ confirmButton.click(), this._page.waitForNavigation({ waitUntil: "load", timeout: this.xrmUiTest.settings.timeout }) ]);
        }
        else {
            throw new Error("Failed to find delete confirmation button");
        }
    }
}