import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

export class Navigation {
  private _page: puppeteer.Page;
  private _crmUrl: string;

  constructor(private xrmUiTest: XrmUiTest) {
    this._page = xrmUiTest.page;
    this._crmUrl = xrmUiTest.crmUrl;
    this.xrmUiTest = xrmUiTest;
  }

  openCreateForm = async (entityName: string) => {
    return Promise.all([
      this._page.goto(
        `${this._crmUrl}/main.aspx?etn=${entityName}&pagetype=entityrecord${
          this.xrmUiTest.AppId ? "&appid=" + this.xrmUiTest.AppId : ""
        }`,
        { waitUntil: "load", timeout: 60000 }
      ),
      this._page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000
      })
    ]);
  };

  openUpdateForm = async (entityName: string, entityId: string) => {
    return Promise.all([
      this._page.goto(
        `${
          this._crmUrl
        }/main.aspx?etn=${entityName}&id=${entityId}&pagetype=entityrecord${
          this.xrmUiTest.AppId ? "&appid=" + this.xrmUiTest.AppId : ""
        }`,
        { waitUntil: "load", timeout: 60000 }
      ),
      this._page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000
      })
    ]);
  };

  openQuickCreate = async (entityName: string) => {
    await EnsureXrmGetter(this._page);

    return Promise.all([
      this._page.evaluate((entityName: string, entityId: string) => {
        const xrm = window.oss_FindXrm();
        return xrm.Navigation.openForm({
          entityName: entityName,
          useQuickCreateForm: true
        });
      }, entityName),

      Promise.race([
        this._page.waitFor(
          "#globalquickcreate_save_button_NavBarGloablQuickCreate"
        ),
        this._page.waitFor("#quickCreateSaveAndCloseBtn")
      ])
    ]);
  };

  openAppById = async (appId: string) => {
    this.xrmUiTest.AppId = appId;

    return Promise.all([
      this._page.goto(`${this._crmUrl}/main.aspx?appid=${appId}`, {
        waitUntil: "load",
        timeout: 60000
      }),
      this._page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000
      })
    ]);
  };

  clickCommand = async (name: string) => {
    const button = await this._page.waitForXPath(
      `//ul[@data-id='CommandBar']//li[@aria-label='${name}']`
    );

    if (!button) {
        throw new Error(`Failed to find button by name ${name}`);
    }

    await button.click();
  };
}

