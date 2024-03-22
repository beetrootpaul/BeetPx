import { expect, test } from "@playwright/test";

// COMMAND ARGS ::

declare global {
  interface Window {
    BEETPX__IS_PROD: boolean;
  }
}

test("is _not_ prod", async ({ page }) => {
  await page.goto("/");

  expect(await page.evaluate(() => window.BEETPX__IS_PROD)).toBe(false);
});
