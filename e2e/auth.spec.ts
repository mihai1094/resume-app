import { expect, test } from "@playwright/test";
import {
  e2eEnv,
  hasLoginCredentials,
  hasRegisterCredentials,
} from "./helpers/env";

test("redirects anonymous editor access to login and preserves returnTo", async ({
  page,
}) => {
  await page.goto("/editor/new?template=modern&color=forest");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Log in to your account" })
  ).toBeVisible();

  const redirectInfo = await page.evaluate(() =>
    window.sessionStorage.getItem("auth_redirect")
  );

  expect(redirectInfo).toContain("/editor/new?template=modern&color=forest");
});

test.describe("email login", () => {
  test.skip(
    !hasLoginCredentials(),
    "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run login flow coverage."
  );

  test("logs in and resumes the protected editor redirect", async ({ page }) => {
    await page.goto("/editor/new?template=modern&color=forest");
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email").fill(e2eEnv.loginEmail!);
    await page.getByLabel("Password").fill(e2eEnv.loginPassword!);
    await page.getByRole("button", { name: /^Log in$/ }).click();

    await expect(page).toHaveURL(/\/editor\/new\?template=modern&color=forest/);
    await expect(
      page.getByRole("button", { name: "Return to dashboard" })
    ).toBeVisible();
  });
});

test.describe("email registration", () => {
  test.skip(
    !hasRegisterCredentials(),
    "Set E2E_TEST_REGISTER_PASSWORD plus either E2E_TEST_REGISTER_EMAIL or E2E_TEST_REGISTER_EMAIL_PREFIX/E2E_TEST_REGISTER_EMAIL_DOMAIN."
  );

  test("registers a new user and lands on templates", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill(e2eEnv.registerEmail!);
    await page.getByLabel("Password").fill(e2eEnv.registerPassword!);
    await page.getByLabel(/I agree to the/i).check();
    await page.getByRole("button", { name: /^Create account$/ }).click();

    await expect(page).toHaveURL(/\/templates$/);
    await expect(
      page.getByRole("heading", { name: "Choose Your Template" })
    ).toBeVisible();
  });
});

test.describe("registration validation", () => {
  test("blocks weak passwords on the client before any redirect", async ({
    page,
  }) => {
    const registerRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/register")) {
        registerRequests.push(request.url());
      }
    });

    await page.goto("/register");

    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill("playwright@example.com");
    await page.locator("input#password").fill("password");
    await page.locator("#terms").click();
    await page.getByRole("button", { name: /^Create account$/ }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByText("Password must contain at least one uppercase letter")
    ).toBeVisible();
    expect(registerRequests).toHaveLength(0);
  });

  test("requires terms acceptance before continuing", async ({ page }) => {
    const registerRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/register")) {
        registerRequests.push(request.url());
      }
    });

    await page.goto("/register");

    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill("playwright@example.com");
    await page.locator("input#password").fill("Password1!");
    await page.getByRole("button", { name: /^Create account$/ }).click();

    await expect(page).toHaveURL(/\/register$/);
    expect(registerRequests).toHaveLength(0);
  });
});
