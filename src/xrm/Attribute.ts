import * as puppeteer from "puppeteer";

export class Attribute {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    getValue = async (attributeName: string) => {
        return await this._page.evaluate((attributeName) => { const xrm = window.Xrm; return xrm.Page.getAttribute(attributeName).getValue(); }, attributeName);
    }

    setValue = async (attributeName: string, value: any) => {
        await this._page.evaluate((a, v) => {
            const xrm = window.Xrm;
            const attribute = xrm.Page.getAttribute(a);

            let editable = false;

            attribute.controls.forEach(c => {
                if (!(c as any).getDisabled() && c.getVisible()) {
                    editable = true;
                }
            });

            if (!editable) {
                throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
            }

            attribute.setValue(v);
            attribute.fireOnChange();
        }, attributeName, value);

        await this._page.waitFor(5000);
    }
}