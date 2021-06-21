# Navigation
There is support for opening UCI apps, update forms and create forms.
All of these calls use parametrized URLs and wait for the page to fully load and all network requests to be finished. This guarantees for a robust and fast usage experience.

## Open UCI apps
UCI apps are currently opened by their appId. You can find it out by opening the app in your D365 organization and taking a look into the URL bar in your browser.

There will be a parameter called appId, which will print the id of the currently opened app.
You can use it like that afterwards:

```javascript
await xrmTest.Navigation.openAppById("3a5ff736-45a5-4318-a05e-c8a98761e64a");
```

## Open create forms
Opening create forms just requires the entity logical name of the entity form that you want to open:

```javascript
await xrmTest.Navigation.openCreateForm("account");
```

## Open update forms
This allows to open forms with existing records. It works just like the `openCreateForm` function, but takes another parameter for the record id:

```javascript
await xrmTest.Navigation.openUpdateForm("account", "83702a07-d3eb-4774-bdab-1d768a2f94d6");
```

## Open quick create
You can open the global quick create very much like `openCreateForm` by calling its function with the entity logical name as parameter. Afterwards you :

```javascript
await xrmTest.Navigation.openQuickCreate("account");

// This will already execute inside the quick create and set the account name
await xrmTest.Attribute.setValue("name", "Test name");

// This will return the id of the record that was created
const id = await xrmTest.Entity.save();
```

## Other navigation options (EntityList, WebResource, EntityRecord)
There is a `navigateTo` function which allows for flexible navigation inside the system. Client SDK is used for issuing navigation calls.

### Open Entity List
```javascript
await xrmTest.Navigation.navigateTo({
    pageType: "entitylist",
    entityName: "account"
});
```