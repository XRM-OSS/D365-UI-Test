import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for navigating in D365
 */
export class Navigation {
    private _page: puppeteer.Page;
    private _crmUrl: string;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this._crmUrl = xrmUiTest.crmUrl;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Opens a create form for the specified entity
     * @param entityName The entity to open the form for
     * @returns Promise which resolves once form is fully loaded
     */
    openCreateForm = async (entityName: string) => {
        return Promise.all([
            this._page.goto(`${this._crmUrl}/main.aspx?etn=${entityName}&pagetype=entityrecord${this.xrmUiTest.AppId ? "&appid=" + this.xrmUiTest.AppId : ""}`, { waitUntil: "load", timeout: 60000 }),
            this._page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
        ]);
    }

    /**
     * Opens an update form for an existing record
     * @param entityName The entity to open the form for
     * @param entityId The id of the record to open
     * @returns Promise which resolves once form is fully loaded
     */
    openUpdateForm = async (entityName: string, entityId: string) => {
        return Promise.all([
            this._page.goto(`${this._crmUrl}/main.aspx?etn=${entityName}&id=${entityId}&pagetype=entityrecord${this.xrmUiTest.AppId ? "&appid=" + this.xrmUiTest.AppId : ""}`, { waitUntil: "load", timeout: 60000 }),
            this._page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
        ]);
    }

    /**
     * Opens a quick create form for the specified entity
     * @param entityName The entity to open the form for
     * @returns Promise which resolves once form is fully loaded
     */
    openQuickCreate = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        await Promise.all([
            this._page.evaluate((entityName: string) => {
                const xrm = window.oss_FindXrm();
                xrm.Navigation.openForm({ entityName: entityName, useQuickCreateForm: true });
            }, entityName),

            Promise.race([ this._page.waitFor("#quickCreateSaveAndCloseBtn"), this._page.waitFor("#globalquickcreate_save_button_NavBarGloablQuickCreate") ])
        ]);

        return this._page.waitForFunction((entityName: string) => {
            const xrm = window.oss_FindXrm();
            return xrm && xrm.Page && xrm.Page.data && xrm.Page.data.entity && xrm.Page.data.entity.getEntityName() === entityName;
        }, undefined, entityName);
    }

    /**
     * Opens the specified UCI app
     * @param appId The id of the app to open
     * @returns Promise which resolves once the app is fully loaded
     */
    openAppById = async(appId: string) => {
        this.xrmUiTest.AppId = appId;

        return Promise.all([
            this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load", timeout: 60000 }),
            this._page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
        ]);
    }
}