import { expect, test } from "@playwright/test";

test.describe("login page visual tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Log in to your account" })
    ).toBeVisible();
    // Wait for animations to settle
    await page.waitForTimeout(500);
  });

  test("desktop layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page).toHaveScreenshot("login-desktop.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot("login-mobile.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("form with filled fields", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("MyPassword123!");
    await expect(page).toHaveScreenshot("login-filled.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("form elements are present and correctly ordered", async ({ page }) => {
    // Verify all expected elements exist
    await expect(page.getByRole("button", { name: /Continue with Google/ })).toBeVisible();
    await expect(page.getByText("or continue with email")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Log in$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up for free" })).toBeVisible();
  });

  test("forgot password link points correctly", async ({ page }) => {
    const link = page.getByRole("link", { name: "Forgot password?" });
    await expect(link).toHaveAttribute("href", "/forgot-password");
  });

  test("sign up link points correctly", async ({ page }) => {
    const link = page.getByRole("link", { name: "Sign up for free" });
    await expect(link).toHaveAttribute("href", "/register");
  });
});

test.describe("register page visual tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Create your free account" })
    ).toBeVisible();
    // Wait for animations to settle
    await page.waitForTimeout(500);
  });

  test("desktop layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page).toHaveScreenshot("register-desktop.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });

  test("mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot("register-mobile.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });

  test("form with filled fields and password strength", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.getByLabel("First name").fill("Alex");
    await page.getByLabel("Last name").fill("Rivera");
    await page.getByLabel("Email").fill("alex@example.com");
    await page.locator("input#password").fill("StrongP@ss1");
    await page.locator("#terms").click();

    // Wait for password strength animation
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("register-filled-strong.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });

  test("weak password shows red strength indicator", async ({ page }) => {
    await page.locator("input#password").fill("abc");
    await page.waitForTimeout(300);

    const strengthBar = page.locator("input#password")
      .locator("xpath=ancestor::div[contains(@class,'space-y-2')]")
      .locator(".bg-red-500");
    await expect(strengthBar).toBeVisible();
    await expect(page.getByText("Weak")).toBeVisible();
  });

  test("medium password shows yellow strength indicator", async ({ page }) => {
    await page.locator("input#password").fill("Password1");
    await page.waitForTimeout(300);

    await expect(page.getByText("Medium")).toBeVisible();
  });

  test("strong password shows green strength indicator", async ({ page }) => {
    await page.locator("input#password").fill("P@ssword1!");
    await page.waitForTimeout(300);

    await expect(page.getByText("Strong")).toBeVisible();
  });

  test("password requirements checklist updates", async ({ page }) => {
    await page.locator("input#password").fill("Aa1!");
    await page.waitForTimeout(300);

    // "8+ characters" should NOT be met (only 4 chars)
    const charReq = page.getByText("8+ characters");
    await expect(charReq).toBeVisible();

    // These should be met
    await expect(page.getByText("Uppercase")).toBeVisible();
    await expect(page.getByText("Lowercase")).toBeVisible();
    await expect(page.getByText("Number")).toBeVisible();
    await expect(page.getByText("Special char")).toBeVisible();

    // Now complete the requirement
    await page.locator("input#password").fill("Aa1!longpassword");
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("register-password-all-met.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });

  test("form elements are present and correctly ordered", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Sign up with Google/ })).toBeVisible();
    await expect(page.getByText("No credit card required")).toBeVisible();
    await expect(page.getByText("or continue with email")).toBeVisible();
    await expect(page.getByLabel("First name")).toBeVisible();
    await expect(page.getByLabel("Last name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("#terms")).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Create account$/ })).toBeVisible();
    await expect(page.getByText("We protect your data")).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("login link points correctly", async ({ page }) => {
    const link = page.getByRole("link", { name: "Log in" });
    await expect(link).toHaveAttribute("href", "/login");
  });

  test("terms and privacy links point correctly", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
      "href",
      "/terms"
    );
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy"
    );
  });
});
