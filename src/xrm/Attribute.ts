import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Attribute {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page, private xrmUiTest: XrmUiTest) {
        this._page = page;
        this.xrmUiTest = xrmUiTest;
    }

    getValue = async (attributeName: string) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((attributeName: string) => { const xrm = window.oss_FindXrm(); return xrm.Page.getAttribute(attributeName).getValue(); }, attributeName);
    }

    setValue = async (attributeName: string, value: any) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((a: string, v: any) => {
            const xrm = window.oss_FindXrm();
            const attribute = xrm.Page.getAttribute(a);

            const editable = attribute.controls.get().some((c: any) => {
                return !c.getDisabled() && c.getVisible();
            });

            if (!editable) {
                throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
            }

            attribute.setValue(v);
            attribute.fireOnChange();
        }, attributeName, value);
    }
}