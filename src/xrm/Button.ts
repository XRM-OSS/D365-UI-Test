import * as puppeteer from "puppeteer";

export class Button {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    press = (buttonName: string) => {
        this._page.evaluate((controlName) => {
            const xrm = window.Xrm;
            const control = xrm.Page.getControl(controlName);

            return {
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean
            };
        }, buttonName);
    }
}