import * as puppeteer from "puppeteer";

export class SubGrid {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }
}