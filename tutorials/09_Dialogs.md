# Dialogs
This namespace is used for handlers that interact with D365 default dialogs. 
Previously the duplicate dialog was controlled from here, but it was integrated in the `xrmTest.Entity.save` function.


For now there is no functionality in here, but as soon as new default dialogs have to be handled, this will be done in here again.


For custom dialogs, you can always just use the page object that you retrieve from `xrmTest.open`.
This allows to interact with the browser using playwright.
