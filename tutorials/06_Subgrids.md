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
const count = await xrmUiTest.Subgrid.openNthRecord("subgrid1", 1);
```

# Refresh
Refreshes the subgrid

```javascript
const count = await xrmUiTest.Subgrid.refresh("subgrid1");
```