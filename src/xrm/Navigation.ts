import * as playwright from "playwright";
import { isPageElement } from "../domain/SharedLogic";
import { D365Selectors } from "../domain/D365Selectors";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Define behavior on navigation, for example handling of blocking popups (e.g. "Do you really want to leave this page?"")
 */
export interface NavigationSettings {
    /**
     * Define whether to confirm or to cancel dialogs that occur on navigation
     */
    popUpAction?: "confirm" | "cancel";
}

/**
 * Define behaviour for opening forms
 */
export interface FormNavigationSettings extends NavigationSettings {
    /**
     * Define the ID of the form to open
     */
    formId?: string;
}

/**
 * Module for navigating in D365
 */
export class Navigation {
    private _page: playwright.Page;
    private _crmUrl: string;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this._crmUrl = xrmUiTest.crmUrl;
        this.xrmUiTest = xrmUiTest;
    }

    private async HandlePopUpOnNavigation (navigationPromise: Promise<playwright.Response | Xrm.Async.PromiseLike<Xrm.Navigation.OpenFormResult>>, settings: NavigationSettings) {
        const defaultSettings: NavigationSettings = {
            popUpAction: "cancel"
        };

        const safeSettings = {
            ...defaultSettings,
            ...settings
        };

        const popUpButton = safeSettings.popUpAction === "cancel"
            ? D365Selectors.PopUp.cancel
            : D365Selectors.PopUp.confirm;

        const result = await Promise.race([
            navigationPromise,
            // Catch dialogs that block navigation
            this._page.waitForSelector(popUpButton, { timeout: this.xrmUiTest.settings.timeout })
        ]);

        if (isPageElement(result)) {
            await Promise.all([
                navigationPromise,
                result.click()
            ]);
        }
    }

    /**
     * Opens a create form for the specified entity
     *
     * @param entityName The entity to open the form for
     * @param settings How to handle dialogs that prevent navigation. Cancel discards the dialog, confirm accepts it. Default is discarding it.
     * @returns Promise which resolves once form is fully loaded
     */
    openCreateForm = async (entityName: string, settings?: FormNavigationSettings) => {
        await EnsureXrmGetter(this._page);

        const navigationPromise = this._page.evaluate(([entityName, formId]) => {
            const xrm = window.oss_FindXrm();

            return xrm.Navigation.openForm({ entityName: entityName, formId: formId ? formId : undefined });
        }, [entityName, settings?.formId]);

        await this.HandlePopUpOnNavigation(navigationPromise, settings);
        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Opens an update form for an existing record
     *
     * @param entityName The entity to open the form for
     * @param entityId The id of the record to open
     * @param settings How to handle dialogs that prevent navigation. Cancel discards the dialog, confirm accepts it. Default is discarding it.
     * @returns Promise which resolves once form is fully loaded
     */
    openUpdateForm = async (entityName: string, entityId: string, settings?: FormNavigationSettings) => {
        await EnsureXrmGetter(this._page);

        const navigationPromise = this._page.evaluate(([ entityName, entityId, formId ]) => {
            const xrm = window.oss_FindXrm();

            return xrm.Navigation.openForm({ entityName: entityName, entityId: entityId, formId: formId ? formId : undefined });
        }, [entityName, entityId, settings?.formId]);

        await this.HandlePopUpOnNavigation(navigationPromise, settings);
        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Navigate to the specified page
     *
     * @param entityName The entity to open the entitylist for
     * @param settings How to handle dialogs that prevent navigation. Cancel discards the dialog, confirm accepts it. Default is discarding it.
     * @returns Promise which resolves once the page is fully loaded
     */
    navigateTo = async (pageInput: Xrm.Navigation.PageInputEntityRecord | Xrm.Navigation.PageInputEntityList | Xrm.Navigation.PageInputHtmlWebResource, navigationOptions?: Xrm.Navigation.NavigationOptions, settings?: NavigationSettings) => {
        await EnsureXrmGetter(this._page);

        const navigationPromise = this._page.evaluate(([ pageInput, navigationOptions ]) => {
            const xrm = window.oss_FindXrm();

            return xrm.Navigation.navigateTo(pageInput, navigationOptions);
        }, [ pageInput, navigationOptions ] as [Xrm.Navigation.PageInputEntityRecord | Xrm.Navigation.PageInputEntityList | Xrm.Navigation.PageInputHtmlWebResource, Xrm.Navigation.NavigationOptions]);

        await this.HandlePopUpOnNavigation(navigationPromise, settings);
        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Opens a quick create form for the specified entity
     *
     * @param entityName The entity to open the form for
     * @returns Promise which resolves once form is fully loaded
     */
    openQuickCreate = async (entityName: string) => {
        await EnsureXrmGetter(this._page);

        await this._page.evaluate((entityName: string) => {
            const xrm = window.oss_FindXrm();

            return xrm.Navigation.openForm({ entityName: entityName, useQuickCreateForm: true });
        }, entityName);

        await this.xrmUiTest.waitForIdleness();
    }

    /**
     * Opens the specified UCI app
     *
     * @param appId The id of the app to open
     * @param settings How to handle dialogs that prevent navigation. Cancel discards the dialog, confirm accepts it. Default is discarding it.
     * @returns Promise which resolves once the app is fully loaded
     */
    openAppById = async(appId: string, settings?: NavigationSettings) => {
        this.xrmUiTest.AppId = appId;

        const navigationPromise = this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, { waitUntil: "load", timeout: this.xrmUiTest.settings.timeout });

        await this.HandlePopUpOnNavigation(navigationPromise, settings);
        await this.xrmUiTest.waitForIdleness();
    }
}
