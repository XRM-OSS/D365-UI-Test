# DevOps
Once you have a working set of UI tests, you should run them automatically using an automated build such as DevOps.

## Getting Started
Easiest way possible is to just create a new build pipeline with the nodejs template.
Afterwards you can just insert below yaml for a build which runs your tests all 2 hours, publishes reports and publishes test results.
You then need to create the 4 pipeline variables crmUrl, userName, userPassword and mfaSecret (at least userPassword and if used mfaSecret should be stored as secret value).
You have to set mfaSecret to an empty value even if you don't have a mfaSecret.

```yaml
# Node.js
# Build a general Node.js project with npm.
# Add steps that analyze code, save build artifacts, deploy, and more:
# https://docs.microsoft.com/azure/devops/pipelines/languages/javascript

trigger:
- master

schedules:
- cron: "0 */2 * * *"
  displayName: Every two hours
  branches:
    include:
    - master
  always: true

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '10.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npm run test
  displayName: 'npm install and build'
  env:
    D365_UI_TEST_URL: $(crmUrl)
    D365_UI_TEST_USERNAME: $(userName)
    D365_UI_TEST_PASSWORD: $(userPassword)
    D365_UI_TEST_MFA_SECRET: $(mfaSecret)
    D365_UI_TEST_HEADLESS: true

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: './reports/'
    ArtifactName: 'Reports'
    publishLocation: 'Container'
  condition: always()

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/junit_*.xml'
    failTaskOnFailedTests: false
  condition: always()
```

## Storing credentials
**You should absolutely not check in your login data into your repository.**

D365-UI-Test advices to store your url, user name and password as dev ops variables. You can easily define them in the yaml editor by clicking the "Variables" button. **Make sure to save at least the user password as secret variable in DevOps**.
The above yaml already takes care of setting environment variables for the D365-UI-Test execution.
You can see that it takes the pipeline variables 'crmUrl', 'userName' and 'userPassword' and assigns them to the variables CRM_URL, USER_NAME and USER_PASSWORD.
These will be able to be accessed in D365-UI-Test like this:

```javascript
const page = await xrmTest.open(process.env.CRM_URL, { userName: process.env.USER_NAME, password: process.env.USER_PASSWORD });
```

## Remarks
When running in DevOps, be sure to use the headless runner as described in 01_Startup:

```javascript
const browser = await xrmTest.launch({
    headless: true,
    args: [
        "--start-fullscreen"
    ]
});
```