# PW-API-Usage

Create a `specs` folder at the root of this project. Add the playwright scripts in that folder. Now do:

```
npm install

npx tsc

node playwright_api_usage.js
```

You should get an output, something like:

```
Playwright API Usage:
{
  "Page.goto": {
    "count": 3
  },
  "MakeMatchers<void, Page, {}>.toHaveTitle": {
    "count": 1
  },
  "Locator.click": {
    "count": 1
  },
  "Page.getByRole": {
    "count": 2
  },
  "MakeMatchers<void, Locator, {}>.toBeVisible": {
    "count": 1
  },
  "TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>.describe": {
    "count": 2
  },
  "TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>.beforeEach": {
    "count": 1
  },
  "MakeMatchers<void, Page, {}>.toHaveURL": {
    "count": 1
  },
  "TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>.beforeAll": {
    "count": 1
  },
  "TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>.afterAll": {
    "count": 1
  }
}
```