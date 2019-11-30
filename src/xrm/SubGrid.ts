import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

export class SubGrid {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    getRecordCount = async( subgridName: string ) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((name) => {
            const xrm = window.oss_FindXrm(); 
            const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);
            
            if (!control) {
                return undefined;
            }

            return control.getGrid().getTotalRecordCount();
        }, subgridName);
    }

    refresh = async( subgridName: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate((name) => {
                const xrm = window.oss_FindXrm(); 
                const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);
                
                if (!control) {
                    return;
                }

                return control.refresh();
            }, subgridName),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
    }
}