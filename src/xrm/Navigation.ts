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
            this._page.waitForNavigation({ waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" }),

            this._page.evaluate((entityName: string) => {
                const xrm = window.oss_FindXrm();
                return xrm.Navigation.openForm({ entityName: entityName }); }
            , entityName)
        ]);
    }

    openUpdateForm = async (entityName: string, entityId: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.waitForNavigation({ waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" }),

            this._page.evaluate((entityName: string, entityId: string) => {
                const xrm = window.oss_FindXrm();
                return xrm.Navigation.openForm({ entityName: entityName, entityId: entityId });
            }, entityName, entityId)
        ]);
    }

    openQuickCreate = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.waitForNavigation({ waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" }),

            this._page.evaluate((entityName: string, entityId: string) => {
                const xrm = window.oss_FindXrm();
                return xrm.Navigation.openForm({ entityName: entityName, useQuickCreateForm: true });
            }, entityName)
        ]);
    }

    openAppById = async(appId: string) => {
        return Promise.all([
            this._page.waitForNavigation({ waitUntil: "networkidle0" }),
            this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load" })
        ]);
    }
}