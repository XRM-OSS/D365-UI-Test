import * as playwright from "playwright";
import { XrmUiTest } from "./XrmUITest";

/**
 * @summary Scheme to define how to access a button
 * Either by data-id (language independent) or by button label (language dependent, but easily visible in UI)
 */
export interface ButtonIdentifier {
    /**
     * @summary Find button by data-id. You can find this in the HTML DOM when inspecting your form. Good if your tests need to be language independent
     * @example account|NoRelationship|Form|mscrmaddons.am.form.createworkingitem.account
     */
    byDataId?: string;

    /**
     * @summary Find button by label. This is the plain button label that you can see in the UI. Be aware of language dependent button labels
     * @example Delete
     */
    byLabel?: string;

    /**
     * @summary Pass a completely custom CSS selector for finding the button to click
     * @example li[id*='DeletePrimaryRecord']
     */
    custom?: string;
}

/**
 * @summary Module for interacting with D365 Buttons
 */
export class Button {
    private _page: playwright.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * @summary Expands the more commands ribbon menu
     * @returns Promise which resolves once more commands was clicked
     */
    expandMoreCommands = async() => {
        await this.click({ byDataId: "OverflowButton" }, false);
    }

    private buildSelector = (identifier: ButtonIdentifier) => {
        if (identifier.byDataId) {
            return `button[data-id='${identifier.byDataId}']`;
        }

        if (identifier.byLabel) {
            return `button[aria-label='${identifier.byLabel}']`;
        }

        if (identifier.custom) {
            return identifier.custom;
        }
    };

    /**
     * @summary Clicks a ribbon button
     * @param buttonIdentifier Identifier for finding button, either by label or by data-id
     * @param openMoreCommands [true] Whether more commands has to be clicked for finding the button. Will be used automatically if button is not found on first try
     * @returns Promise which resolves once button was clicked
     */
    click = async(buttonIdentifier: ButtonIdentifier, openMoreCommands = true) => {
        const selector = this.buildSelector(buttonIdentifier);
        const button = await this._page.$(selector);

        if (!button && openMoreCommands) {
            await this.expandMoreCommands();
            await this.click(buttonIdentifier, false);
            return;
        }

        if (!button) {
            throw new Error("Failed to find button");
        }

        return button.click();
    }
}