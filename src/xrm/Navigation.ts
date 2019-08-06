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

        await this._page.evaluate((entityName: string) => {
            const xrm = window.oss_FindXrm(); return xrm.Navigation.openForm({ entityName: entityName }); }
        , entityName);
    }

    openUpdateForm = async (entityName: string, entityId: string) => {
        await EnsureXrmGetter(this._page);

        await this._page.evaluate((entityName: string, entityId: string) => {
            const xrm = window.oss_FindXrm(); return xrm.Navigation.openForm({ entityName: entityName, entityId: entityId });
        }, entityName, entityId);
    }

    openAppById = async(appId: string) => {
        await this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load" });

        await this._page.waitForNavigation({ waitUntil: "networkidle2" });
    };
}