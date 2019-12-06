import * as puppeteer from "puppeteer";
import { XrmUiTest } from "./XrmUITest";

/**
 * Scheme to define how to access a button
 * Either by data-id (language independent) or by button label (language dependent, but easily visible in UI)
 */
interface ButtonIdentifier {
    /**
     * Find button by data-id. You can find this in the HTML DOM when inspecting your form. Good if your tests need to be language independent
     * @example account|NoRelationship|Form|mscrmaddons.am.form.createworkingitem.account
     */
    byDataId?: string;

    /**
     * Find button by label. This is the plain button label that you can see in the UI. Be aware of language dependent button labels
     * @example Delete
     */
    byLabel?: string;
}

export class Button {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Expands the more commands ribbon menu
     * @returns Promise which resolves once more commands was clicked
     */
    expandMoreCommands = async() => {
        const button = await this._page.$("#moreCommands a");

        if (button) {
            return button.click();
        }
    }

    private buildSelector = (identifier: ButtonIdentifier) => {
        if (identifier.byDataId) {
            return `button[data-id='${identifier.byDataId}']`;
        }

        if (identifier.byLabel) {
            return `button[aria-label='${identifier.byLabel}']`;
        }
    };

    /**
     * Clicks a ribbon button
     * @deprecated Please use Button.click instead
     * @param buttonIdentifier Identifier for finding button, either by label or by data-id
     * @param openMoreCommands Whether more commands has to be clicked for finding the button. Will be used automatically if button is not found on first try
     * @returns Promise which resolves once button was clicked
     */
    press = async(buttonIdentifier: ButtonIdentifier, openMoreCommands = false) => {
        return this.click(buttonIdentifier, openMoreCommands);
    }

    /**
     * Clicks a ribbon button
     * @param buttonIdentifier Identifier for finding button, either by label or by data-id
     * @param openMoreCommands Whether more commands has to be clicked for finding the button. Will be used automatically if button is not found on first try
     * @returns Promise which resolves once button was clicked
     */
    click = async(buttonIdentifier: ButtonIdentifier, openMoreCommands = false) => {
        const selector = this.buildSelector(buttonIdentifier);
        const button = await this._page.$(selector);

        if (!button && !openMoreCommands) {
            await this.expandMoreCommands();
            await this.press(buttonIdentifier, true);
            return;
        }

        if (!button) {
            throw new Error("Failed to find button");
        }

        return button.click();
    }
}