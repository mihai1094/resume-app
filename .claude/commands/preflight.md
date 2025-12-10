# Preflight Check

Run the preflight checklist before deploying or creating a PR.

## Steps

1. Run `npm run lint` - check for linting issues
2. Run `npm run build` - verify production build succeeds
3. Check for any uncommitted changes with `git status`
4. Review recent changes with `git diff HEAD~1`
5. Verify no security vulnerabilities (check for hardcoded secrets, env vars exposure)
6. Check accessibility patterns are followed (per docs/ux/a11y-guardrails.md)

Report a summary of all checks with pass/fail status.
