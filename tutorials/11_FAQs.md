# FAQs

## Can I download files, e.g. reports, Excel exports or Documents Core Pack documents?
Yes, you can. Just issue this playwright call before doing the actions that open the download dialog:

```javascript
const client = await page.target().createCDPSession();
        
await client.send('Page.setDownloadBehavior', {
    behavior: 'allow', downloadPath: path.resolve(__dirname, "../reports")
});
```

This will accept all following downloads and save them to the defined path.

You can check whether the file was successfully downloaded using the `checkForFile` function of `TestUtils`:
```javascript
await TestUtils.checkForFile(page, path.resolve("./reports"), [".pdf", ".pdf'"]);
```