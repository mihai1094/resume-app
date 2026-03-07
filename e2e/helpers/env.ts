function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function buildRegisterEmail(): string | undefined {
  const explicitEmail = optionalEnv("E2E_TEST_REGISTER_EMAIL");
  if (explicitEmail) return explicitEmail;

  const prefix = optionalEnv("E2E_TEST_REGISTER_EMAIL_PREFIX");
  const domain = optionalEnv("E2E_TEST_REGISTER_EMAIL_DOMAIN");

  if (!prefix || !domain) return undefined;

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}+${runId}@${domain}`;
}

export const e2eEnv = {
  loginEmail: optionalEnv("E2E_TEST_EMAIL"),
  loginPassword: optionalEnv("E2E_TEST_PASSWORD"),
  registerEmail: buildRegisterEmail(),
  registerPassword: optionalEnv("E2E_TEST_REGISTER_PASSWORD"),
  publicDownloadPath: optionalEnv("E2E_PUBLIC_RESUME_DOWNLOAD_PATH"),
};

export function hasLoginCredentials(): boolean {
  return Boolean(e2eEnv.loginEmail && e2eEnv.loginPassword);
}

export function hasRegisterCredentials(): boolean {
  return Boolean(e2eEnv.registerEmail && e2eEnv.registerPassword);
}

export function hasPublicDownloadPath(): boolean {
  return Boolean(e2eEnv.publicDownloadPath);
}
