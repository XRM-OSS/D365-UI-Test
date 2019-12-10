# Troubleshooting

## NavigationTimeouts lead to test failures
On most of the navigation functions we wait for a successful page load and for all network requests to finish before proceeding.
There are however some cases (interestingly especially at night) where waiting for our default of 60 seconds does not suffice.
Some of the URLs that cause trouble (and are not necessary for Dynamics to function) are already blacklisted.

If you come across those issues, you can use `TestUtils.`:
```javascript
TestUtils.trackTimedOutRequest(page, () => xrmTest.Navigation.openAppById("3a5ff736-45a5-4318-a05e-c8a98761e64a"));
```

If timeouts occur, D365-UI-Test will log the timed out request URLs to console.