import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";

export class Navigation {
    private _page: puppeteer.Page;
    private _crmUrl: string;

    constructor(crmUrl: string, page: puppeteer.Page) {
        this._page = page;
        this._crmUrl = crmUrl;
    }

    openCreateForm = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            this._page.evaluate((entityName: string) => {
                const xrm = window.oss_FindXrm(); return xrm.Navigation.openForm({ entityName: entityName }); }
            , entityName),

            this._page.waitForNavigation({ waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
    }

    openUpdateForm = async (entityName: string, entityId: string) => {
        await EnsureXrmGetter(this._page);

        return Promise.all([
            await this._page.evaluate((entityName: string, entityId: string) => {
                const xrm = window.oss_FindXrm(); return xrm.Navigation.openForm({ entityName: entityName, entityId: entityId });
            }, entityName, entityId),

            this._page.waitForNavigation({ waitUntil: "load" }),
            this._page.waitForNavigation({ waitUntil: "networkidle0" })
        ]);
    }

    openAppById = async(appId: string) => {
        return Promise.all([
            this._page.waitForNavigation( { waitUntil: "networkidle0" } ),
            this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load" })
        ]);
    };
}