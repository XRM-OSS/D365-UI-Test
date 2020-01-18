import * as puppeteer from "puppeteer";

export const EnsureXrmGetter = async(page: puppeteer.Page) => {
    await page.evaluate(() => {
        if (!!window.oss_FindXrm) {
            return;
        }

        window.oss_FindXrm = () => {
            if (window.Xrm && (window.Xrm as any).Internal && (window.Xrm as any).Internal && (window.Xrm as any).Internal && (window.Xrm as any).Internal.isUci && (window.Xrm as any).Internal.isUci()) {
                return window.Xrm;
            }

            const frames = Array.from(document.querySelectorAll("iframe"))
                .filter(f => f.style.visibility !== "hidden")
                .filter(f => { try { return f.contentWindow && f.contentWindow.Xrm; } catch { return false; } })
                .map(f => f.contentWindow.Xrm)
                .filter(f => f.Page);

            return frames.length ? frames[0] : window.Xrm;
        };
    });
};

declare global {
    interface Window { oss_FindXrm: () => Xrm.XrmStatic; }
}