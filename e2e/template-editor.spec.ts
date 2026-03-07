import { expect, test } from "@playwright/test";

test("loads the template gallery", async ({ page }) => {
  await page.goto("/templates");

  await expect(
    page.getByRole("heading", { name: "Choose Your Template" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /select modern template/i })
  ).toBeVisible();
});

test("signed-out template selection redirects to login with the chosen template", async ({
  page,
}) => {
  await page.goto("/templates");
  await page.getByRole("button", { name: /select modern template/i }).click();

  await expect(page).toHaveURL(/\/login$/);

  const redirectInfo = await page.evaluate(() =>
    window.sessionStorage.getItem("auth_redirect")
  );

  expect(redirectInfo).toContain("/editor/new?template=modern");
});

test("signed-out default-template CTA redirects to login and preserves the editor path", async ({
  page,
}) => {
  await page.goto("/templates");
  await page.getByRole("link", { name: /use default template/i }).click();

  await expect(page).toHaveURL(/\/login$/);

  const redirectInfo = await page.evaluate(() =>
    window.sessionStorage.getItem("auth_redirect")
  );

  expect(redirectInfo).toContain("/editor/new");
});
