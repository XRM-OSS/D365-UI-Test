# Tabs
Tabs don't need to be used for getting or setting values.
However you might want to open them for your IFrames to load correctly (hidden ones will not load on start in D365).

## Open
You can expand / select the active tab like this:

```javascript
await xrmTest.Tab.open("tab_1");
```

## Hidden State
Hidden state can be retrieved like this:

```javascript
const { isVisible } = await xrmTest.Tab.get("SUMMARY_TAB");
```