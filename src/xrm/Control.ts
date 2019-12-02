import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Control {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    get = async (controlName: string) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((controlName: string) => {
            const xrm = window.oss_FindXrm();
            const control = xrm.Page.getControl(controlName);

            return {
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean
            };
        }, controlName);
    }
}