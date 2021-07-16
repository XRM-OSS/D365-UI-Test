# Subgrids
There are various functions for interacting with subgrids, which are listed below.

# Get record count
Gets the number of records that are currently displayed.

```javascript
const count = await xrmUiTest.Subgrid.getRecordCount("subgrid1");
```

# Open n-th record
Opens the update form for the record at position n.

```javascript
await xrmUiTest.Subgrid.openNthRecord("subgrid1", 1);
```

# Refresh
Refreshes the subgrid

```javascript
await xrmUiTest.Subgrid.refresh("subgrid1");
```

# Create new record
Takes care of opening the tab where the subgrid resides and clicking its "Add New Record" default button.
If the button is hidden inside the overflow menu, the overflow menu is searched as well.

Note:
> If the button fails to get clicked, check user permissions, button hide rules and whether you use custom create buttons, as we search for the default create button

```javascript
await xrmUiTest.Subgrid.createNewRecord("subgrid1");
```