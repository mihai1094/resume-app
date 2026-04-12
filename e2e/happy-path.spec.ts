import { expect, test } from "@playwright/test";
import { e2eEnv, hasRegisterCredentials } from "./helpers/env";

test.describe("happy path", () => {
  test.skip(
    !hasRegisterCredentials(),
    "Set E2E_TEST_REGISTER_PASSWORD plus either E2E_TEST_REGISTER_EMAIL or E2E_TEST_REGISTER_EMAIL_PREFIX/E2E_TEST_REGISTER_EMAIL_DOMAIN."
  );

  test("registers, creates a resume, exports PDF, and shows the saved card on the dashboard", async ({
    page,
  }) => {
    await page.goto("/register");

    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill(e2eEnv.registerEmail!);
    await page.getByLabel("Password").fill(e2eEnv.registerPassword!);
    await page.getByLabel(/I agree to the/i).check();
    await page.getByRole("button", { name: /^Create account$/ }).click();

    await expect(page).toHaveURL(/\/templates$/);
    await page.getByRole("button", { name: /select modern template/i }).click();

    await expect(page).toHaveURL(/\/editor\/new\?template=modern/);
    await expect(page.getByLabel("First Name")).toBeVisible();

    await page.getByLabel("First Name").fill("Playwright");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email").fill("playwright.resume@example.com");
    await page.getByLabel("Phone").fill("1234567890");
    await page.getByLabel("Location").fill("Madrid");

    const sectionNav = page.locator("nav").first();
    await sectionNav.getByRole("button", { name: /^Skills/i }).click();
    await page.getByLabel("Add skill").fill("React");
    await page.getByLabel("Add skill").press("Enter");

    await page.getByRole("button", { name: /open more options/i }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: /export pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    await page.getByRole("button", { name: /save and exit/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Playwright Tester")).toBeVisible();
  });
});
