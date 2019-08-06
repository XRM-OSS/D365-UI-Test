import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

export class Control {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    get = async (controlName: string) => {
        await EnsureXrmGetter(this._page);

        return await this._page.evaluate((controlName) => {
            const xrm = window.oss_FindXrm();
            const control = xrm.Page.getControl(controlName);

            return {
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean
            };
        }, controlName);
    }
}