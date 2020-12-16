# Entity
These are functions for dealing with the entity data on a form.

## No Submit
When just opening a create form and entering data, you might not even want to save your data.
If you just try to navigate away without saving, then a confirm message will appear, reminding you that you have unsaved data.


```javascript
await xrmTest.Entity.noSubmit();
``` 

If you really want to navigate to a different page without saving, call the `xrmTest.Entity.noSubmit` function for setting all attributes to submitMode `never`, so that none would be saved and thus CRM does not show the prompt.

## Save
Saves the data on your current form.

```javascript
await xrmTest.Entity.save();
``` 

> This does not use the save button, but the SDK function for saving

## Get Id
Gets the ID of the current record.

```javascript
const id = await xrmTest.Entity.getId();
``` 

## Get Entity Name
Gets the logical name of the current record (entity)

```javascript
await xrmTest.Entity.getEntityName();
``` 

## Get Entity Reference
Gets an entity reference pointing to the current record.

```javascript
const { id, entityName, name } = await xrmTest.Entity.getEntityReference();
``` 

> The return object has the schema { id: string, entityName: string, name: string }

## Delete
Deletes the current record.

```javascript
await xrmTest.Entity.delete();
``` 

> This function uses the delete button of the form.