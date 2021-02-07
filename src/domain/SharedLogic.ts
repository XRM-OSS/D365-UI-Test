import * as playwright from "playwright";

export const isPageElement = (value: any): value is playwright.ElementHandle<SVGElement | HTMLElement> => {
    return !!value && (value as playwright.ElementHandle<SVGElement | HTMLElement>).click !== undefined;
}