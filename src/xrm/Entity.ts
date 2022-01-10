import * as playwright from "playwright";
import { D365Selectors } from "../domain/D365Selectors";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";
import { RethrownError } from "../utils/RethrownError";

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
     * Refreshes the current form record
     *
     * @param saveData Whether to save any unsubmitted data
     */
    refresh = async (saveData: boolean, ignoreDuplicateCheck = false) => {
        await EnsureXrmGetter(this._page);

        const refreshPromise = this._page.evaluate(([ save ]) => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.refresh(save);
        }, [ saveData ]);

        const promises = [
            refreshPromise,
            this.xrmUiTest.waitForIdleness()
        ];

        return this.handleDuplicateCheck(promises, ignoreDuplicateCheck);
    }

    handleDuplicateCheck = async (promises: Array<Promise<any>>, ignoreDuplicateCheck = false) => {
        await Promise.race([
            ...promises,
            // Wait for duplicate dialog
            this._page.waitForSelector(D365Selectors.DuplicateDetection.ignore, { timeout: this.xrmUiTest.settings.timeout })
        ]);

        const duplicateCheckButton = await this._page.$(D365Selectors.DuplicateDetection.ignore);

        if (duplicateCheckButton) {
            if (ignoreDuplicateCheck) {
                await Promise.all([duplicateCheckButton.click(), Promise.race(promises)]);
            }
            else {
                await this._page.click(D365Selectors.DuplicateDetection.abort);
                throw new Error("Duplicate records found. Pass true for save parameter 'ignoreDuplicateCheck' for ignore and saving");
            }
        }
    };

    /**
     * Saves the record and returns the ID (both for quick create and "normal" create)
     *
     * @param ignoreDuplicateCheck [false] Whether to automatically ignore duplicate check warnings
     * @returns The id of the record
     */
    save = async (ignoreDuplicateCheck = false) => {
        try {
            await EnsureXrmGetter(this._page);

            const waitSelectors = [
                // This is the id of the notification that gets shown once a quick create record is saved
                this._page.waitForSelector("div[id^=quickcreate_]", { timeout: this.xrmUiTest.settings.timeout })
            ];

            const saveResult = this._page.evaluate(() => {
                const xrm = window.oss_FindXrm();

                return new Promise((resolve, reject) => {
                    xrm.Page.data.save().then(resolve, reject);
                });
            });

            const promises = [
                ...waitSelectors,
                saveResult,
                // Normal page should switch to idle again
                this.xrmUiTest.waitForIdleness()
            ];

            await this.handleDuplicateCheck(promises, ignoreDuplicateCheck);

            const quickCreate = await this._page.$("div[id^=quickcreate_]");

            if (quickCreate) {
                const handle = await quickCreate.getProperty("id");
                const id: string = await handle.jsonValue();

                return id.substr(12);
            }

            return this.getId();
        }
        catch (e) {
            throw new RethrownError(`Error while saving, message: ${(e as any).title} - ${(e as any).message}`, e);
        }
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
     * Get the logical name of the currently opened record
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
        await this.xrmUiTest.Button.click({ custom: "li[id*='DeletePrimaryRecord']" });

        await Promise.all([
            this._page.waitForNavigation({ waitUntil: "load", timeout: this.xrmUiTest.settings.timeout }),
            this._page.click(D365Selectors.PopUp.confirm, { timeout: this.xrmUiTest.settings.timeout })
        ]);

        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Deactivate the current record
     *
     * @returns Promise which resolves once deactivation is done
     * @remarks Deactivate button on form will be used
     */
    deactivate = async() => {
        await this.xrmUiTest.Button.click({ custom: "li[id*='Mscrm.Form.Deactivate']" });

        await this._page.click("button[data-id='ok_id']", { timeout: this.xrmUiTest.settings.timeout });
        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Activate the current record
     *
     * @returns Promise which resolves once activation is done
     * @remarks Activate button on form will be used
     */
    activate = async() => {
        await this.xrmUiTest.Button.click({ custom: "li[id*='Mscrm.Form.Activate']" });

        await this._page.click("button[data-id='ok_id']", { timeout: this.xrmUiTest.settings.timeout });
        await this.xrmUiTest.waitForIdleness();
    }
}
