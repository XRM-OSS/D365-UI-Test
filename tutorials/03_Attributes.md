# Attributes
When interacting with D365, one of the core functionalities is to set values on entity records.
D365-UI-Test makes this as easy as possible by allowing you to pass plain values which are set using the setValue function of the SDK.

This has some advantages over other approaches:
- We don't have breaking changes or issues with new controls. The values can be set as in all of your form scripts.
- Localization of Option Set controls does not cause issues
- PCF controls don't need special handling

> When setting an attribute value, we use the SDK for checking whether there is at least one visible and non-disabled control for this attribute, to ensure that a user would be able to set it as well.

## Get required level
The requirement level can be retrieved like this:
```javascript
// Either "none", "recommended" or "required"
const requiredLevel = await xrmTest.Attribute.getRequiredLevel("name");
```

## Get Value
Values can be retrieved like this:

```javascript
const value = await xrmTest.Attribute.getValue("name");
```

## Set values
Values can be set in single like this:

```javascript
await xrmTest.Attribute.setValue("name", "Test name");
```

Sometimes you want to set multiple fields at once. 
For this there is a function which takes an object with keys equal to the field logical names and values which should be set.

All values will be set and D365-UI-Test will wait for a configurable settle time for onChange events to happen.

Example:
```javascript
await xrmTest.Attribute.setValues({
    // Text or memo field
    "name": "Test name",
    // Option Set
    "customertypecode": 3,
    // Two options
    "msdyn_taxexempt": true,
    // Decimal / Number / Currency
    "creditlimit": 123.12,
    // Date
    "birthdate": new Date(),
    // Lookup
    "oss_countryid": [{entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"}]
});
```

The settle time can be passed as second value. It defaults to 2000ms, so 2 seconds. If you wish to overwrite it, pass it with your amount of milliseconds to wait.

In an advanced use case you might even have a json file residing in your project with field names and values to set, so that you can just configure the values that are set without changing the script.

In those cases you can parse your json file and pass the JSON object.

Let's assume we have a file "accountValues.json" in our project root and our test cases in a folder "spec" inside the root dir.

`accountValues.json`:
```javascript
{
    "name": "Test name",
    "customertypecode": 3,
    "msdyn_taxexempt": true,
    "creditlimit": 123.12,
    "oss_countryid": [{entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"}]
}
```

`spec/DemoTest.spec.ts`:
```javascript
const values = fs.readFileSync(path.resolve(__dirname, "../accountValues.json"), {encoding: "utf-8"});

const json = JSON.parse(values);

await xrmTest.Attribute.setValues(json);
```