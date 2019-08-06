import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

interface FormIdentifier {
    byName: string;
    byId: string;
}

export class Form {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
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
            await this._page.evaluate((i) => {
                const xrm = window.oss_FindXrm();

                (xrm.Page.ui.formSelector.items.get(i) as any).navigate();
            }, identifier.byId);
        }
        else if (identifier.byName) {
            await this._page.evaluate((i) => {
                const xrm = window.oss_FindXrm();

                (xrm.Page.ui.formSelector.items as any).getByFilter((f: any) => f._label === i).navigate();
            }, identifier.byName);
        }
        else {
            throw new Error("Choose to search by id or name");
        }

        await this._page.waitForNavigation({ waitUntil: "networkidle2" });
    }
}