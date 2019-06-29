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
    
    private executeXrmSnippet = (snippet: (xrm: Xrm.XrmStatic) => any) => {
        // subject to change, we'll access the context differently using a non deprecated approach at a later point
        const xrm = (this.page.frames as any)[0].Xrm || (this.page as any).Xrm;
        
        if (!xrm) {
            throw new Error("Failed to retrieve XRM context");
        }

        return snippet(xrm);
    }

    openCreateForm = (entityName: string) => {
        this.executeXrmSnippet((xrm) => xrm.Navigation.openForm({ entityName: entityName }));
    }

    openUpdateForm = (entityName: string, entityId: string) => {
        this.executeXrmSnippet((xrm) => xrm.Navigation.openForm({ entityName: entityName, entityId: entityId }));
    }

    getAttributeValue = (attributeName: string) => {
        return this.executeXrmSnippet((xrm) => xrm.Page.getAttribute(attributeName).getValue());
    }

    getControl = (controlName: string) => {
        this.executeXrmSnippet((xrm) => {
            const control = xrm.Page.getControl(controlName);

            return { 
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean 
            };
        });
    }

    setAttributeValue = (attributeName: string, value: any) => {
        this.executeXrmSnippet((xrm) => {
            const attribute = xrm.Page.getAttribute(attributeName);
            const controls = Array.from(attribute.controls as any) as Array<Xrm.Controls.Control>;
            
            if (!controls.find(c => !(c as any).getDisabled() && c.getVisible())) {
                throw new Error("Attribute has no unlocked and visible control, users can't set a value like that.");
            }

            attribute.setValue(value);
            attribute.fireOnChange();
        });
    }

    openAppById = async(appId: string) => {
        await this.page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`);
    };

    save = (attributeName: string) => {
        this.executeXrmSnippet((xrm) => xrm.Page.data.entity.save());
    }

    reset = () => {
        this.executeXrmSnippet((xrm) => xrm.Page.getAttribute().forEach(a => a.setSubmitMode("never")));
    }

    launch = async (launchOptions?: puppeteer.LaunchOptions) => {
        this._browser = await puppeteer.launch(launchOptions);
        return this.browser;
    }

    openCRM = async (url: string, appId?: string) =>
    {
        this._crmUrl = url;
        this._appId = appId;

        this._page = await this.browser.newPage();
        
        await this.page.goto(url);

        return this.page;
    }   

    close = async () => {
        this.browser.close();
    }
}