import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";
import { D365Selectors } from "../domain/D365Selectors";

/**
 * Module for interacting with D365 Grids / Entity Lists
 */
export class Grid {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Opens the record in the grid at the n-th index
     *
     * @param {Number} recordNumber Index of the record to open, zero based
     * @returns {Promise<void>} Promise which fulfills when record is opened
     */
    openNthRecord = async(recordNumber: number ) => {
        // Our recordNumber is zero based. In Dynamics it starts at 1, with 1 being the header row. So real data starts at index 2
        const rowToClick = await this._page.$(D365Selectors.Grid.DataRowWithIndexCheckBox.replace("{0}", `${recordNumber + 2}`));

        if (rowToClick) {
            await rowToClick.dblclick();
            await this.xrmUiTest.waitForIdleness();
        }
        else {
            throw new Error(`Failed to find grid row ${recordNumber}`);
        }
    }

    /**
     * Selects the record in the grid at the n-th index
     *
     * @param {Number} recordNumber Index of the record to select, zero based
     * @returns {Promise<void>} Promise which fulfills when record is selected
     */
    selectNthRecord = async(recordNumber: number ) => {
        // Our recordNumber is zero based. In Dynamics it starts at 1, with 1 being the header row. So real data starts at index 2
        const rowToClick = await this._page.$(D365Selectors.Grid.DataRowWithIndexCheckBox.replace("{0}", `${recordNumber + 2}`));

        if (rowToClick) {
            await rowToClick.click();
            await this.xrmUiTest.waitForIdleness();
        }
        else {
            throw new Error(`Failed to find grid row ${recordNumber}`);
        }
    }
}