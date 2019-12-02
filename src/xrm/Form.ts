import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

interface FormIdentifier {
    byName: string;
    byId: string;
}

export class Form {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    reset = async () => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((a, v) => {
            const xrm = window.oss_FindXrm();

            xrm.Page.getAttribute().forEach(a => a.setSubmitMode("never"));
        });
    }

    switch = async (identifier: FormIdentifier) => {
        await EnsureXrmGetter(this._page);

        if (identifier.byId) {
            return Promise.all([
                this._page.evaluate((i) => {
                    const xrm = window.oss_FindXrm();

                    (xrm.Page.ui.formSelector.items.get(i) as any).navigate();
                }, identifier.byId),
                this._page.waitForNavigation({ waitUntil: "networkidle0" })
            ]);
        }
        else if (identifier.byName) {
            return Promise.all([
                this._page.evaluate((i) => {
                    const xrm = window.oss_FindXrm();

                    (xrm.Page.ui.formSelector.items as any).getByFilter((f: any) => f._label === i).navigate();
                }, identifier.byName),
                this._page.waitForNavigation({ waitUntil: "networkidle0" })
            ]);
        }
        else {
            throw new Error("Choose to search by id or name");
        }

    }
}