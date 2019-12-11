# Buttons

## Click
Buttons can be clicked either by name or by data-id.
The data-ids can be found in the HTML DOM, the labels are just the ones you see in the D365 UI.
This should also work for clicking subgrid buttons.

## By Label
Clicks the first button with the specified label:

```javascript
await xrmTest.Button.click({ byLabel: "Create Document" });
```

## By Data-Id
Clicks the first button with the specified data-id:

```javascript
await xrmTest.Button.click({ byDataId: "account|NoRelationship|Form|mscrmaddons.am.form.createworkingitem.account" });
```