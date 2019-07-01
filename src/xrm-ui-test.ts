import * as puppeteer from "puppeteer";

export class XrmUiTest
{
    private _browser: puppeteer.Browser;
    private _page: puppeteer.Page;
    private _crmUrl: string;
    private _appId: string;

    get browser() {
        return this._browser;
    }

    get page() {
        return this._page;
    }

    openCreateForm = async (entityName: string) => {
        await this.page.evaluate((entityName) => {
            const xrm = window.Xrm; return xrm.Navigation.openForm({ entityName: entityName }) }
        , entityName);
    }

    openUpdateForm = async (entityName: string, entityId: string) => {
        await this.page.evaluate((entityName, entityId) => {
            const xrm = window.Xrm; return xrm.Navigation.openForm({ entityName: entityName, entityId: entityId }) 
        }, entityName, entityId);
    }

    delete = async() => {
        const deleteButton = await this.page.$("li[Command$='DeletePrimaryRecord']") || await this.page.$("li[id*='DeletePrimaryRecord']");

        if (!deleteButton) 
        {
            throw new Error("Failed to find delete button");
        }

        await deleteButton.click();

        await this.page.waitFor(5000);
        
        const confirmButton = await this.page.$("#butBegin") || await this.page.$("#confirmButton");

        if (confirmButton)
        {
            await confirmButton.click();
            await this.page.waitForNavigation({ waitUntil: "networkidle2" });
        }
        else 
        {
            throw new Error("Failed to find delete confirmation button");
        }
    }

    confirmDuplicateDetection = async() => {
        await this.page.waitFor(2000);
        const confirmButton = await this.page.$("#butBegin") || await this.page.$("button[data-id='ignore_save']");
        
        if (confirmButton) 
        {
            await confirmButton.click();
            await this.page.waitForNavigation({ waitUntil: "networkidle0" });
            
            await this.page.waitFor(5000);
        }
    }

    getAttributeValue = async (attributeName: string) => {
        return await this.page.evaluate((attributeName) => { const xrm = window.Xrm; return xrm.Page.getAttribute(attributeName).getValue(); }, attributeName);
    }

    getControl = (controlName: string) => {
        this.page.evaluate((controlName) => {
            const xrm = window.Xrm; 
            const control = xrm.Page.getControl(controlName);

            return { 
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean 
            };
        }, controlName);
    }

    setAttributeValue = async (attributeName: string, value: any) => {
        await this.page.evaluate((a, v) => 
        {
            const xrm = window.Xrm;
            const attribute = xrm.Page.getAttribute(a);

            let editable = false;

            attribute.controls.forEach(c => {
                if (!(c as any).getDisabled() && c.getVisible()) {
                    editable = true;
                }
            });

            if (!editable) {
                throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
            }

            attribute.setValue(v);
            attribute.fireOnChange();
        }, attributeName, value);

        await this.page.waitFor(5000);
    }

    openAppById = async(appId: string) => {
        await this.page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`);
        
        await this.page.waitForNavigation({ waitUntil: "networkidle2" });
    };

    save = async () => {
        await this.page.evaluate(() => {
            const xrm = window.Xrm; 
            
            xrm.Page.data.entity.save();
        });
    }

    reset = async () => {
        return this.page.evaluate((a, v) => 
        {
            const xrm = window.Xrm;

            xrm.Page.getAttribute().forEach(a => a.setSubmitMode("never"));
        });
    }

    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        this._browser = await puppeteer.launch(launchOptions);
        return this.browser;
    }

    openCRM = async (url: string, extendedProperties?: { appId?: string; userName?: string; password?: string}) =>
    {
        this._crmUrl = url;
        this._appId = extendedProperties && extendedProperties.appId;

        this._page = await this.browser.newPage();
        await this.page.setViewport({width: 1920, height: 1080 })

        await this.page.goto(url);

        if (extendedProperties && extendedProperties.userName && extendedProperties.password)
        {
            console.log(url);
            console.log(extendedProperties.userName);

            const userName = await this.page.waitForSelector("#i0116");
            await userName.type(extendedProperties.userName);

            await this.page.waitFor(1000);
            await userName.press("Enter");
            await this.page.waitFor(1000);

            const password = await this.page.waitForSelector("#i0118");
            password.type(extendedProperties.password);

            await this.page.waitFor(1000);
            await password.press("Enter");
            await this.page.waitFor(1000);

            const remember = await this.page.waitForSelector("#idBtn_Back");
            await remember.click();
            await this.page.waitFor(1000);

            await this.page.waitForNavigation({ waitUntil: "networkidle0" });
        }

        return this.page;
    }   

    close = async () => {
        await this.browser.close();
    }
}