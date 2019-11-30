import * as puppeteer from "puppeteer";

export class Dialog {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    confirmDuplicateDetection = async() => {
        await Promise.race([
            this._page.waitFor(3000),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);

        const confirmButton = await this._page.$("#butBegin") || await this._page.$("button[data-id='ignore_save']");

        if (confirmButton) {
            return Promise.all([
                confirmButton.click(),
                this._page.waitForNavigation({ waitUntil: "networkidle0" })
            ]);
        }
    }
}