import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Entity {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    save = async () => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate(() => {
                const xrm = window.oss_FindXrm();

                return xrm.Page.data.save();
            }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
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