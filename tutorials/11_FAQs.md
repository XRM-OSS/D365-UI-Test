# FAQs

## Can I download files, e.g. reports, Excel exports or Documents Core Pack documents?
Yes, you can. You just need to set the `acceptDownloads` property on the browserContext settings:

```javascript
await xrmTest.launch("chromium", 
    {
        headless: false,
        args: [
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--start-fullscreen',
            '--window-position=0,0',
            '--window-size=1920,1080',
            '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"'
        ]
    },
    {
        allowDownloads: true
    })
```

This will accept all following downloads and save them with a generic file name.
If you wish to save it with the name that the browser intended to, you can do so as follows:

```javascript
const [ download ] = await Promise.all([
  page.waitForEvent('download'), // wait for download to start
  page.click('a') // Or any other event that triggers your download
]);

const suggestedFileName = download.suggestedFilename();
await download.saveAs(`./yourDownloadFolder/suggestedFileName`);
```

You can check whether the file was successfully downloaded using the `checkForFile` function of `TestUtils`:
```javascript
await TestUtils.checkForFile(page, path.resolve("./reports"), [".pdf", ".pdf'"]);
```

## Can I interact with Xrm functions that are not implemented by now?
Yes, you can. You can use `page.evaluate` for doing this. You should be careful, as page.evaluate can not access variables from its outer context.

You have to pass all variables that you want to use as second argument in `page.evaluate` like this:

```javascript
const logicalName = "account";
const id = "someid";

await page.evaluate((l, i) => {
    window.Xrm.WebApi.deleteRecord(l, i);
}, [ logicalName, id ]);
```