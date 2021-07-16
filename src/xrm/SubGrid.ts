import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 Subgrids
 */
export class SubGrid {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Gets the record count of the specified subgrid
     *
     * @param {String} subgridName The control name of the subgrid to use
     * @returns {Promise<number>} Promise which fulfills with the total record count
     */
    getRecordCount = async(subgridName: string ) => {
        try {
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
        catch (e) {
            throw new RethrownError(`Error when getting record count of subgrid '${subgridName}'`, e);
        }
    }

    /**
     * Opens the record in the subgrid at the n-th index
     *
     * @param {String} subgridName The control name of the subgrid to use
     * @param {Number} recordNumber Index of the record to open, zero based
     * @returns {Promise<void>} Promise which fulfills when record is opened
     */
    openNthRecord = async(subgridName: string, recordNumber: number ) => {
        try {
            await EnsureXrmGetter(this._page);

            const recordReference = await this._page.evaluate(([name, position]: [string, number]) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);

                if (!control) {
                    return undefined;
                }

                const grid = control.getGrid();
                const record = grid.getRows().get(position).getData();

                return record.getEntity().getEntityReference();
            }, [subgridName, recordNumber]);

            return this.xrmUiTest.Navigation.openUpdateForm(recordReference.entityType, recordReference.id);
        }
        catch (e) {
            throw new RethrownError(`Error when setting opening record ${recordNumber} of subgrid '${subgridName}'`, e);
        }
    }

    /**
     * Opens the create record form by using this subgrid "Add New" button
     * @param {String} subgridName The control name of the subgrid to use
     */
    createNewRecord = async(subgridName: string) => {
        try {
            await EnsureXrmGetter(this._page);

            const parentTab = await this._page.evaluate(([name]: [string]) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);

                if (!control) {
                    return undefined;
                }

                return control.getParent().getParent().getName();
            }, [subgridName]);

            await this.xrmUiTest.Tab.open(parentTab);

            const subgridEntity = await this._page.evaluate(([name]: [string]) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);

                if (!control) {
                    return undefined;
                }

                return control.getEntityName();
            }, [subgridName]);

            await this.xrmUiTest.waitForIdleness();

            // Normal selector for button inside this subgrid's command bar
            const addNewButton = await this._page.$(`div[data-control-name='${subgridName}'] button[data-id*='Mscrm.SubGrid.${subgridEntity}.AddNewStandard']`);

            if (addNewButton) {
                await addNewButton.click();
            }
            else {
                // Find this subgrid's overflow button for expanding additional commands
                const overflowButton = await this._page.$(`div[data-control-name='${subgridName}'] button[data-id*='OverflowButton']`);

                if (!overflowButton) {
                    throw new Error("Failed to find the add new button on your subgrid as well as the overflow button. Please check user permissions, button hide rules and whether you use custom create buttons, as we search for the default create button");
                }

                await overflowButton.click();
                // Ribbon button inside the overflow flyout is not child of the subgrid anymore, but of the overflowflyout. Adapted selector
                await this._page.click(`ul[data-id='OverflowFlyout'] button[data-id*='Mscrm.SubGrid.${subgridEntity}.AddNewStandard']`);
            }

            return this.xrmUiTest.waitForIdleness();
        }
        catch (e) {
            throw new RethrownError(`Error when trying to create new record in subgrid '${subgridName}'`, e);
        }
    }

    /**
     * Refreshes the specified subgrid
     *
     * @param {String} subgridName The control name of the subgrid to refresh
     * @returns {Promise<void>} Promise which fulfills once refreshing is done
     */
    refresh = async(subgridName: string) => {
        try {
            await EnsureXrmGetter(this._page);

            return this._page.evaluate((name) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl<Xrm.Controls.GridControl>(name);

                if (!control) {
                    return;
                }

                return control.refresh();
            }, subgridName);
        }
        catch (e) {
            throw new RethrownError(`Error when refreshing subgrid '${subgridName}'`, e);
        }
    }
}