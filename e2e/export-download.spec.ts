import { expect, test } from "@playwright/test";
import { e2eEnv, hasPublicDownloadPath } from "./helpers/env";

test.describe("public resume download", () => {
  test.skip(
    !hasPublicDownloadPath(),
    "Set E2E_PUBLIC_RESUME_DOWNLOAD_PATH to verify the public download endpoint."
  );

  test("returns a PDF response", async ({ request }) => {
    const response = await request.post(e2eEnv.publicDownloadPath!);

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect(response.headers()["content-disposition"]).toContain(".pdf");
  });
});
