import * as fs from "fs";
import * as path from "path";
import * as playwright from "playwright";

export namespace TestUtils {
    /**
     * Clear all files in a folder (or matching a specified file ending)
     *
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
     *
     * @param page Page object of current playwright session
     * @param filePath Path where the screenshot should be saved on failure. Has to include file ending such as .png.
     * @param func Your actual test
     * @example
     * test("Open UCI", takeScreenShotOnFailure("OpenUCI", async () => {
     *     return xrmTest.Navigation.openAppById("default365");
     * }));
     */
    export const takeScreenShotOnFailure = (pageGetter: () => playwright.Page, filePath: string, func: () => void | Promise<void>): any => {
        return async () => {
            try {
                await Promise.resolve(func());
            }
            catch (e) {
                const page = pageGetter();

                // Page can be null in case playwright fails to start. Accessing it to take a screenshot would fail and overwrite the root exception
                if (page) {
                    const dirName = path.dirname(filePath);
                    const folderExists = fs.existsSync(dirName);

                    if (!folderExists) {
                        fs.mkdirSync(dirName);
                    }

                    console.log("Saving error screenshot to " + filePath);

                    await page.screenshot({ path: filePath });
                }

                throw(e);
            }
        };
    };

    const checkForFileInternal = async (page: playwright.Page, pathName: string, fileEndings: Array<string>, sleepTime: number, numberOfTries: number, tries = 0): Promise<boolean> => {
        if (tries >= numberOfTries) {
            return Promise.reject(`Tried ${numberOfTries} times, aborting`);
        }

        const found = await new Promise((resolve, reject) => fs.readdir(pathName, (err, files) => err ? reject(err) : resolve(files.some(f => fileEndings.some(e => f.endsWith(e))))));

        if (found) {
            return true;
        }

        await page.waitForTimeout(sleepTime);
        return checkForFileInternal(page, pathName, fileEndings, sleepTime, numberOfTries, ++tries);
    };

    /**
     * Checks for a file to exist. Useful for validating if playwright downloads succeeded.
     *
     * @param page playwright page object for current session
     * @param pathName Folder path to search
     * @param fileEndings File ending to search for. Can be full name as well
     * @param sleepTime [500] Time to wait between checks
     * @param numberOfTries [10] Number of tries to do
     */
    export const checkForFile = async (page: playwright.Page, pathName: string, fileEndings: Array<string>, sleepTime = 500, numberOfTries = 10): Promise<boolean> => {
        return checkForFileInternal(page, pathName, fileEndings, sleepTime, numberOfTries);
    };

    class InflightRequests {
        _page: playwright.Page;
        _requests: Set<Request>;

        constructor(page: playwright.Page) {
          this._page = page;
          this._requests = new Set();
          this._onStarted = this._onStarted.bind(this);
          this._onFinished = this._onFinished.bind(this);
          this._page.on("request", this._onStarted);
          this._page.on("requestfinished", this._onFinished);
          this._page.on("requestfailed", this._onFinished);
        }

        _onStarted(request: any) { this._requests.add(request); }
        _onFinished(request: any) { this._requests.delete(request); }

        inflightRequests() { return Array.from(this._requests); }

        dispose() {
          this._page.removeListener("request", this._onStarted);
          this._page.removeListener("requestfinished", this._onFinished);
          this._page.removeListener("requestfailed", this._onFinished);
        }
    }

    /**
     * If you come across network timeouts when using this library, you can use this function for finding out which requests were causing this.
     *
     * @param page The page object for the current session
     * @param func The function call that causes the navigation timeout
     * @example await trackTimedOutRequest(page, () => xrmTest.Navigation.openAppById("d365default"));
     */
    export const trackTimedOutRequest = async (page: playwright.Page, func: () => void | Promise<void>) => {
        const tracker = new InflightRequests(page);

        try {
            await Promise.resolve(func());
        }
        catch (e) {
            console.log("Navigation failed: " + e.message);
            const inflight = tracker.inflightRequests();
            console.log(inflight.map((request: any) => "  " + request.url()).join("\n"));
            tracker.dispose();

            throw(e);
        }
    };
}