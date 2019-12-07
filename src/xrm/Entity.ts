import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Entity {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Sets all attributes to submit mode none. This is useful if you don't want to save and just change the page. No prompt for unsaved data will open.
     * @returns Promise which resolves once all attribute submit modes are set
     */
    noSubmit = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((a: string, v: any) => {
            const xrm = window.oss_FindXrm();

            const attributes = xrm.Page.getAttribute();

            attributes.forEach(a => a.setSubmitMode("never"));
        });
    }

    /**
     * Saves the record and returns the ID (both for quick create and "normal" create)
     * @returns The id of the record
     */
    save = async () => {
        await EnsureXrmGetter(this._page);

        const [saveResult, raceResult] = await Promise.all([
            this._page.evaluate(() => {
                const xrm = window.oss_FindXrm();

                return xrm.Page.data.save();
            }),
            Promise.race([
                // This is the id of the notification that gets shown once a quick create record is saved
                this._page.waitForSelector("div[id^=quickcreate_]"),
                // On normal page save a reload will occur
                this._page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
            ])
        ]);

        const quickCreate = await this._page.$("div[id^=quickcreate_]");

        if (quickCreate) {
            const handle = await quickCreate.getProperty("id");
            const id: string = await handle.jsonValue();

            return id.substr(12);
        }

        return this.getId();
    }

    getId = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getId();
        });
    }

    getEntityName = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getEntityName();
        });
    }

    getEntityReference = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            return xrm.Page.data.entity.getEntityReference();
        });
    }

    delete = async() => {
        const deleteButton = await Promise.race([ this._page.waitForSelector("li[Command$='DeletePrimaryRecord']"), this._page.waitForSelector("li[id*='DeletePrimaryRecord']") ]);

        if (!deleteButton) {
            throw new Error("Failed to find delete button");
        }

        await deleteButton.click();

        const confirmButton = await Promise.race([ this._page.waitForSelector("#butBegin"), this._page.waitForSelector("#confirmButton")]);

        if (confirmButton) {
            return Promise.all([ confirmButton.click(), this._page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }) ]);
        }
        else {
            throw new Error("Failed to find delete confirmation button");
        }
    }
}