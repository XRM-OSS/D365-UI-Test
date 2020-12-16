# Troubleshooting

## NavigationTimeouts lead to test failures
On most of the navigation functions we wait for the page to settle by checking that it stays idle for 2 seconds without interruption.

If it gets busy during those two seconds, we reset the 2 seconds wait time.

If you nonetheless get time out errors, you can track which requests timed out using the `TestUtils.trackTimedOutRequest` function:

```javascript
TestUtils.trackTimedOutRequest(() => page, () => xrmTest.Navigation.openAppById("3a5ff736-45a5-4318-a05e-c8a98761e64a"));
```

If timeouts occur, D365-UI-Test will log the timed out request URLs to console.