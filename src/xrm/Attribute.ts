import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * Define behavior during setting of field values
 */
interface SetValueSettings {
    /**
     * Time to wait after setting a value to give onChange handlers time to work
     */
    settleTime?: number;
    /**
     * Set value no matter whether field is readonly or hidden
     */
    forceValue?: boolean;
}

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
     *
     * @param attributeName Name of the attribute
     * @returns Required level of the specified attribute
     */
    getRequiredLevel = async (attributeName: string) => {
        try {
            await EnsureXrmGetter(this._page);

            return this._page.evaluate((attributeName: string) => {
                const xrm = window.oss_FindXrm();
                return xrm.Page.getAttribute(attributeName).getRequiredLevel();
            }, attributeName);
        }
        catch (e) {
            throw new RethrownError(`Error when getting required level of attribute '${attributeName}'`, e);
        }
    }

    /**
     * Gets the value of the specified attribute
     *
     * @param attributeName Name of the attribute
     * @returns Value of the specified attribute
     */
    getValue = async (attributeName: string) => {
        try {
            await EnsureXrmGetter(this._page);

            const [attributeType, value] = await this._page.evaluate((attributeName: string) => {
                const xrm = window.oss_FindXrm();
                const attribute = xrm.Page.getAttribute(attributeName);
                const attributeType = attribute.getAttributeType();

                const isDate = attributeType === "datetime";
                const value = attribute.getValue();

                return [ attributeType, (isDate && value != undefined) ? value.toISOString() : value ];
            }, attributeName);

            if (attributeType === "datetime" && typeof (value) === "string") {
                return new Date(Date.parse(value));
            }
            else {
                return value;
            }
        }
        catch (e) {
            throw new RethrownError(`Error when getting value of attribute '${attributeName}'`, e);
        }
    }

    /**
     * Sets the value of the specified attribute
     *
     * @param attributeName Name of the attribute
     * @param value Value to set
     * @param settings [{settleTIme: 500, forceValue: false}] Settings defining time to wait (ms) after setting value for letting onChange events occur and whether to also write into hidden and readonly fields.
     * @returns Returns promise that resolves once value is set and settleTime is over
     */
    setValue = async (attributeName: string, value: any, settings?: number | SetValueSettings) => {
        try {
            const defaults: SetValueSettings = {
                settleTime: 500,
                forceValue: false
            };

            const safeSettings = {
                ...defaults,
                ...(typeof(settings) === "number" ? { settleTime: settings } as SetValueSettings : settings)
            };

            const isDate = Object.prototype.toString.call(value) === "[object Date]";
            await EnsureXrmGetter(this._page);

            await this._page.evaluate(([a, v, s]) => {
                const xrm = window.oss_FindXrm();
                const attribute = xrm.Page.getAttribute(a);

                const editable = s.forceValue || attribute.controls.get().some((control: any) => {
                    return !control.getDisabled() && control.getVisible() && (!control.getParent() || control.getParent().getVisible()) && (!control.getParent() || !control.getParent().getParent() || control.getParent().getParent().getVisible());
                });

                if (!editable) {
                    throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
                }

                attribute.setValue(attribute.getAttributeType() === "datetime" ? new Date(v) : v);
                attribute.fireOnChange();
            }, [ attributeName, isDate ? value.toISOString() : value, safeSettings ]);

            await this._page.waitForTimeout(safeSettings.settleTime);
            await this.xrmUiTest.waitForIdleness();
        }
        catch (e) {
            throw new RethrownError(`Error when setting value of attribute '${attributeName}'`, e);
        }
    }

    /**
     * Sets multiple attribute values at once
     *
     * @param values JS object with keys matching the attribute names and values containing the values to set
     * @param settings [{settleTIme: 500, forceValue: false}] Settings defining time to wait (ms) after setting value for letting onChange events occur and whether to also write into hidden and readonly fields.
     * @returns Returns promise that resolves once values are set and settleTime is over
     * @example XrmUiTest.Attribute.setValues({ name: "Account Name", creditlimit: 50000, customertypecode: 1, transactioncurrencyid: [{entityType: "transactioncurrency", name: "EURO", id: "someId"}] })
     */
    setValues = async (values: {[key: string]: any}, settings?: number | SetValueSettings) => {
        for (const attributeName in values) {
            await this.setValue(attributeName, values[attributeName], settings);
        }
    }
}
