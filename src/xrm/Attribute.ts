import * as playwright from "playwright";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Module for interacting with D365 Attributes
 */
export class Attribute {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Gets the required level of the specified attribute
     * @param attributeName Name of the attribute
     * @returns Required level of the specified attribute
     */
    getRequiredLevel = async (attributeName: string) => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((attributeName: string) => {
            const xrm = window.oss_FindXrm();
            return xrm.Page.getAttribute(attributeName).getRequiredLevel();
        }, attributeName);
    }

    /**
     * Gets the value of the specified attribute
     * @param attributeName Name of the attribute
     * @returns Value of the specified attribute
     */
    getValue = async (attributeName: string) => {
        await EnsureXrmGetter(this._page);

        const value = await this._page.evaluate((attributeName: string) => {
            const xrm = window.oss_FindXrm();
            const attribute = xrm.Page.getAttribute(attributeName);

            const isDate = attribute.getAttributeType() === "datetime";
            const value = attribute.getValue();

            return (isDate && value != undefined) ? value.toISOString() : value;
        }, attributeName);

        const date = Date.parse(value);

        return (isNaN(date) ? value : new Date(date));
    }

    /**
     * Sets the value of the specified attribute
     * @param attributeName Name of the attribute
     * @param value Value to set
     * @param settleTime [200] Time to wait (ms) after setting value for letting onChange events occur.
     * @returns Returns promise that resolves once value is set and settleTime is over
     */
    setValue = async (attributeName: string, value: any, settleTime = 200) => {
        const isDate = Object.prototype.toString.call(value) === "[object Date]";
        await EnsureXrmGetter(this._page);

        await this._page.evaluate(([a, v]) => {
            const xrm = window.oss_FindXrm();
            const attribute = xrm.Page.getAttribute(a);

            const editable = attribute.controls.get().some((c: any) => {
                return !c.getDisabled() && c.getVisible();
            });

            if (!editable) {
                throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
            }

            attribute.setValue(attribute.getAttributeType() === "datetime" ? new Date(v) : v);
            attribute.fireOnChange();
        }, [ attributeName, isDate ? value.toISOString() : value ]);

        return this._page.waitForTimeout(settleTime);
    }

    /**
     * Sets multiple attribute values at once
     * @param values JS object with keys matching the attribute names and values containing the values to set
     * @param settleTime [2000] Time to wait after setting the values for letting onChange events occur
     * @returns Returns promise that resolves once values are set and settleTime is over
     * @example XrmUiTest.Attribute.setValues({ name: "Account Name", creditlimit: 50000, customertypecode: 1, transactioncurrencyid: [{entityType: "transactioncurrency", name: "EURO", id: "someId"}] })
     */
    setValues = async (values: {[key: string]: any}, settleTime = 2000) => {
        await EnsureXrmGetter(this._page);

        await this._page.evaluate((values: {[key: string]: any}) => {
            const xrm = window.oss_FindXrm();

            Object.keys(values).forEach(a => {
                const attribute = xrm.Page.getAttribute(a);

                const editable = attribute.controls.get().some((c: any) => {
                    return !c.getDisabled() && c.getVisible();
                });

                if (!editable) {
                    throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
                }

                attribute.setValue(attribute.getAttributeType() === "datetime" ? new Date(values[a]) : values[a]);
                attribute.fireOnChange();
            });
        }, Object.keys(values).reduce((all, key) => {
            const value = values[key];

            const isDate = Object.prototype.toString.call(value) === "[object Date]";

            all[key] = isDate ? value.toISOString() : value;
            return all;
        }, {} as {[key: string]: any}));

        return this._page.waitForTimeout(settleTime);
    }
}