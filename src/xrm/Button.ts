import * as puppeteer from "puppeteer";
import { XrmUiTest } from "./XrmUITest";

interface ButtonIdentifier {
    byDataId?: string;
    byLabel?: string;
}

export class Button {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    expandMoreCommands = async() => {
        const button = await this._page.$("#moreCommands a");

        if (button) {
            return button.click();
        }
    }

    buildSelector = (identifier: ButtonIdentifier) => {
        if (identifier.byDataId) {
            return `button[data-id='${identifier.byDataId}']`;
        }

        if (identifier.byLabel) {
            return `button[aria-label='${identifier.byLabel}']`;
        }
    };

    // Example of dataId: account|NoRelationship|Form|mscrmaddons.am.form.createworkingitem.account
    // Example of label: Delete
    press = async(buttonIdentifier: ButtonIdentifier, moreCommandsVisible = false) => {
        const selector = this.buildSelector(buttonIdentifier);
        const button = await this._page.$(selector);

        if (!button && !moreCommandsVisible) {
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