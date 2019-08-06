import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

export class Entity {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    save = async () => {
        await EnsureXrmGetter(this._page);

        await this._page.evaluate(() => {
            const xrm = window.oss_FindXrm();

            xrm.Page.data.entity.save();
        });
    }

    delete = async() => {
        const deleteButton = await this._page.$("li[Command$='DeletePrimaryRecord']") || await this._page.$("li[id*='DeletePrimaryRecord']");

        if (!deleteButton) {
            throw new Error("Failed to find delete button");
        }

        await deleteButton.click();
        await this._page.waitFor(() => !!document.querySelector("#butBegin") || !!document.querySelector("#confirmButton"));

        const confirmButton = await this._page.$("#butBegin") || await this._page.$("#confirmButton");

        if (!confirmButton) {
            throw new Error("Failed to find delete confirmation button");
        }

        await confirmButton.click();
        await this._page.waitForNavigation({ waitUntil: "networkidle2" });
    }
}