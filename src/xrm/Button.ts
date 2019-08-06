import * as puppeteer from "puppeteer";

interface ButtonIdentifier {
    byDataId: string;
    byLabel: string;
}

export class Button {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    expandMoreCommands = async() => {
        const button = await this._page.$("#moreCommands a");

        if (button) {
            await button.click();
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

        await button.click();
    }
}