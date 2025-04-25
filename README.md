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
Playwright API Usage (grouped by type):
{
  "Page": {
    "getByRole": 2,
    "goto": 3
  },
  "MakeMatchers<void, Page, {}>": {
    "toHaveTitle": 1,
    "toHaveURL": 1
  },
  "Locator": {
    "click": 1
  },
  "MakeMatchers<void, Locator, {}>": {
    "toBeVisible": 1
  },
  "TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>": {
    "afterAll": 1,
    "beforeAll": 1,
    "beforeEach": 1,
    "describe": 2
  }
}
```