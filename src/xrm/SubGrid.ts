import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class SubGrid {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
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

    openNthRecord = async( subgridName: string, recordNumber: number ) => {
        await EnsureXrmGetter(this._page);

        const recordReference = await this._page.evaluate((name) => {
            const xrm = window.oss_FindXrm();
            const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);

            if (!control) {
                return undefined;
            }

            const grid = control.getGrid();
            const record = grid.getRows().get(recordNumber).getData();

            return record.getEntity().getEntityReference();
        }, subgridName);

        return this.xrmUiTest.Navigation.openUpdateForm(recordReference.entityType, recordReference.id);
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