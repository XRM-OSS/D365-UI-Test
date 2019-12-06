import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";

export namespace TestUtils {
    /**
     * Clear all files in a folder (or matching a specified file ending)
     * @param pathName Folder where files need to be cleaned
     * @param fileEndings Endings which determine which files to delete. Leave empty to delete all. @default undefined
     * @param createIfNotFound Create folder if not found. @default false
     */
    export const clearFiles = async (pathName: string, fileEndings: Array<string> = undefined, createIfNotFound = false): Promise<void> => {
        const exists = await new Promise((resolve, reject) => fs.exists(pathName, (exists) => resolve(exists)));

        if (!exists && createIfNotFound) {
            fs.mkdirSync(pathName);
        }

        return new Promise((resolve, reject) => fs.readdir(pathName, (err, files) => err ? reject(err) : resolve(files.filter(f => !fileEndings || fileEndings.some(e => f.endsWith(e))).forEach(f => fs.unlinkSync(path.resolve(pathName, f))))));
    };

    /**
     * Take screenshots on function failure. Useful for taking screenshots for failed tests. Will rethrow the error.
     * @param page Page object of current puppeteer session
     * @param filePath Path where the screenshot should be saved on failure. Has to include file ending such as .png.
     * @param func Your actual test
     * @example
     * test("Open UCI", takeScreenShotOnFailure("OpenUCI", async () => {
     *     return xrmTest.Navigation.openAppById("default365");
     * }));
     */
    export const takeScreenShotOnFailure = (page: puppeteer.Page, filePath: string, func: () => void): any => {
        return async () => {
            try {
                await Promise.resolve(func());
            }
            catch (e) {
                const reportsExists = fs.existsSync(path.resolve(__dirname, "../reports"));

                if (!reportsExists) {
                    fs.mkdirSync(path.resolve(__dirname, "../reports"));
                }

                console.log("Saving error screenshot to " + filePath);

                await page.screenshot({ path: filePath });
                throw e;
            }
        };
    };

    const checkForFileInternal = async (page: puppeteer.Page, pathName: string, fileEndings: Array<string>, sleepTime = 500, tries = 0): Promise<boolean> => {
        if (tries >= 10) {
            return Promise.reject("Tried 10 times, aborting");
        }

        const found = await new Promise((resolve, reject) => fs.readdir(pathName, (err, files) => err ? reject(err) : resolve(files.some(f => fileEndings.some(e => f.endsWith(e))))));

        if (found) {
            return true;
        }

        await page.waitFor(sleepTime);
        return checkForFileInternal(page, pathName, fileEndings, sleepTime, ++tries);
    };

    /**
     * Checks for a file to exist. Useful for validating if puppeteer downloads succeeded.
     * @param page Puppeteer page object for current session
     * @param pathName Folder path to search
     * @param fileEndings File ending to search for. Can be full name as well
     * @param sleepTime Time to wait between checks, @default 500
     */
    export const checkForFile = async (page: puppeteer.Page, pathName: string, fileEndings: Array<string>, sleepTime = 500): Promise<boolean> => {
        return checkForFileInternal(page, pathName, fileEndings, sleepTime);
    };
}