# Sectopms
Sections are only used for being able to get their visibility state.

## Hidden State
Hidden state can be retrieved like this:

```javascript
const { isVisible } = await xrmTest.Section.get("SUMMARY_TAB", "section1");
```