import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

export class Entity {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    save = async () => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate(() => {
                const xrm = window.oss_FindXrm();
                
                return xrm.Page.data.entity.save();
            }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
    }

    delete = async() => {
        const deleteButton = await Promise.race([ this._page.waitForSelector("li[Command$='DeletePrimaryRecord']"), this._page.waitForSelector("li[id*='DeletePrimaryRecord']") ]);

        if (!deleteButton) 
        {
            throw new Error("Failed to find delete button");
        }

        await deleteButton.click();
        
        const confirmButton = await Promise.race([ this._page.waitForSelector("#butBegin"), this._page.waitForSelector("#confirmButton")]);

        if (confirmButton)
        {
            return Promise.all([ confirmButton.click(), this._page.waitForNavigation({ waitUntil: "networkidle0" }) ])
        }
        else 
        {
            throw new Error("Failed to find delete confirmation button");
        }
    }
}