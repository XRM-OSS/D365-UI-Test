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