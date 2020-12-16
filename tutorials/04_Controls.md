# Controls
Controls can currently be checked for their disabled state, their hidden state and their option set values (to check if filtering works).

## Hidden / Disabled State
Hidden and disabled state can be retrieved as a combined object:

```javascript
const { isVisible, isDisabled } = await xrmTest.Control.get("name");
```

## Options
The array of currently available options for a control can be retrieved like this:
```javascript
const options = await xrmTest.Control.getOptions("industrycode");
```