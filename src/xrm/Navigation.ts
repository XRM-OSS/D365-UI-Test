import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Navigation {
    private _page: puppeteer.Page;
    private _crmUrl: string;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this._crmUrl = xrmUiTest.crmUrl;
        this.xrmUiTest = xrmUiTest;
    }

    openCreateForm = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate((entityName: string) => {
                const xrm = window.oss_FindXrm();
                xrm.Navigation.openForm({ entityName: entityName }); }
            , entityName),

            this._page.waitForNavigation({ waitUntil: "networkidle0" }),
            this._page.waitForNavigation({ waitUntil: "load" })
        ]);
    }

    openUpdateForm = async (entityName: string, entityId: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate((entityName: string, entityId: string) => {
                const xrm = window.oss_FindXrm();
                xrm.Navigation.openForm({ entityName: entityName, entityId: entityId });
            }, entityName, entityId),

            this._page.waitForNavigation({ waitUntil: "networkidle0" }),
            this._page.waitForNavigation({ waitUntil: "load" })
        ]);
    }

    openQuickCreate = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate((entityName: string, entityId: string) => {
                const xrm = window.oss_FindXrm();
                return xrm.Navigation.openForm({ entityName: entityName, useQuickCreateForm: true });
            }, entityName),

            Promise.race([ this._page.waitFor("#globalquickcreate_save_button_NavBarGloablQuickCreate"), this._page.waitFor("#quickCreateSaveAndCloseBtn") ])
        ]);
    }

    openAppById = async(appId: string) => {
        return Promise.all([
            this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
    }
}