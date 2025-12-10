# Review Pull Request

Review a pull request for code quality, patterns, and potential issues.

## Arguments

- `$ARGUMENTS` - The PR number or URL to review

## Steps

1. Fetch the PR details using `gh pr view`
2. Get the diff using `gh pr diff`
3. Review changes for:
   - Code style consistency with project patterns
   - TypeScript type safety
   - Potential bugs or edge cases
   - Performance implications
   - Security considerations (OWASP top 10)
   - Accessibility (a11y) compliance
4. Check if changes follow the patterns in CLAUDE.md
5. Provide a summary with specific, actionable feedback
