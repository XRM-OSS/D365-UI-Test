import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 Web API
 */
export class WebApi {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Create a single record
     *
     * @param entityLogicalName Entity logical name of the record to create
     * @param data JSON Object with attribute names and values
     * @returns Promise which fulfills once the record has been created
     */
    createRecord = async (entityLogicalName: string, data: any): Promise<Xrm.CreateResponse> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(([entityLogicalName, data]) => {
            const xrm = window.oss_FindXrm();

            return xrm.WebApi.createRecord(entityLogicalName, data);
        }, [entityLogicalName, data]);
    }

    /**
     * Retrieves a single record
     *
     * @param entityLogicalName Entity LogicalName of the record to retrieve
     * @param id ID of the record to retrieve
     * @param options OData system query options
     * @returns Promise which fulfills with the requested record data
     */
    retrieveRecord = async (entityLogicalName: string, id: string, options?: string): Promise<any> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(([entityLogicalName, id, options]) => {
            const xrm = window.oss_FindXrm();

            return xrm.WebApi.retrieveRecord(entityLogicalName, id, options);
        }, [entityLogicalName, id, options]);
    }

    /**
     * Retrieves multiple records
     *
     * @param entityLogicalName Entity logical name of the entity to retrieve
     * @param options OData system query options or FetchXML query
     * @param maxPageSize Specify the number of records to return per page
     * @returns Promise which fulfills with the data once the retrieval succeeds
     */
    retrieveMultipleRecords = async (entityLogicalName: string, options?: string, maxPageSize?: number): Promise<Xrm.RetrieveMultipleResult> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(([entityLogicalName, options, maxPageSize]) => {
            const xrm = window.oss_FindXrm();

            return xrm.WebApi.retrieveMultipleRecords(entityLogicalName, options, maxPageSize);
        }, [entityLogicalName, options, maxPageSize] as [string, string?, number?]);
    }

    /**
     * Updates a single record
     *
     * @param entityLogicalName Entity logical name of the record to retrieve
     * @param id ID of the record to update
     * @param data JSON Object with attribute names and values
     * @returns Promise which fulfills once the update succeeds
     */
    updateRecord = async (entityLogicalName: string, id: string, data: any): Promise<any> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(([entityLogicalName, id, data]) => {
            const xrm = window.oss_FindXrm();

            return xrm.WebApi.updateRecord(entityLogicalName, id, data);
        }, [entityLogicalName, id, data]);
    }

    /**
     * Delete a single record
     *
     * @param entityLogicalName Entity logical name of the record to retrieve
     * @param id ID of the record to delete
     * @returns Promise which fulfills once the deletion succeeds
     */
    deleteRecord = async (entityLogicalName: string, id: string): Promise<any> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate(([entityLogicalName, id]) => {
            const xrm = window.oss_FindXrm();

            return xrm.WebApi.deleteRecord(entityLogicalName, id);
        }, [entityLogicalName, id]);
    }
}