import * as playwright from "playwright";
import { RethrownError } from "../utils/RethrownError";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * State of a control
 */
export interface ControlState {
    /**
     * Whether the control is currently visible
     */
    isVisible: boolean;

    /**
     * Whether the control is currently disabled
     */
    isDisabled: boolean;
}

/**
 * Module for interacting with D365 Controls
 */
export class Control {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Gets the state of the specified control
     *
     * @param controlName Name of the control to retrieve
     * @returns Promise which fulfills with the current control state
     */
    get = async (controlName: string): Promise<ControlState> => {
        try {
            await EnsureXrmGetter(this._page);

            return this._page.evaluate((controlName: string) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl(controlName);

                return {
                    isVisible: control.getVisible() && (!control.getParent() || control.getParent().getVisible()) && (!control.getParent() || !control.getParent().getParent() || control.getParent().getParent().getVisible()),
                    isDisabled: (control as any).getDisabled() as boolean
                };
            }, controlName);
        }
        catch (e) {
            throw new RethrownError(`Error when setting value of control '${controlName}'`, e);
        }
    }

    /**
     * Gets the options of the specified option set control
     *
     * @param controlName Name of the control to retrieve
     * @returns Promise which fulfills with the control's options
     */
    getOptions = async (controlName: string): Promise<Array<Xrm.OptionSetValue>> => {
        try {
            await EnsureXrmGetter(this._page);

            return this._page.evaluate((controlName: string) => {
                const xrm = window.oss_FindXrm();
                const control = xrm.Page.getControl<Xrm.Controls.OptionSetControl>(controlName);

                return (control as any).getOptions();
            }, controlName);
        }
        catch (e) {
            throw new RethrownError(`Error when getting options of control '${controlName}'`, e);
        }
    }
}