import * as puppeteer from "puppeteer";

export class Entity {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    save = async () => {
        await this._page.evaluate(() => {
            const xrm = window.Xrm;

            xrm.Page.data.entity.save();
        });
    }

    reset = async () => {
        return this._page.evaluate((a, v) => {
            const xrm = window.Xrm;

            xrm.Page.getAttribute().forEach(a => a.setSubmitMode("never"));
        });
    }

    delete = async() => {
        const deleteButton = await this._page.$("li[Command$='DeletePrimaryRecord']") || await this._page.$("li[id*='DeletePrimaryRecord']");

        if (!deleteButton) {
            throw new Error("Failed to find delete button");
        }

        await deleteButton.click();

        await this._page.waitFor(5000);

        const confirmButton = await this._page.$("#butBegin") || await this._page.$("#confirmButton");

        if (confirmButton) {
            await confirmButton.click();
            await this._page.waitForNavigation({ waitUntil: "networkidle2" });
        }
        else {
            throw new Error("Failed to find delete confirmation button");
        }
    }
}