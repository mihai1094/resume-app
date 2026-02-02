# Claude Code Configuration

This directory contains Claude Code-specific configuration and documentation.

## Directory Structure

```
.claude/
├── agents/          # Custom agent configurations
├── commands/        # Custom slash commands
├── plans/           # Saved implementation plans
└── settings.local.json  # Local Claude settings
```

## Custom Commands

Available slash commands for this project:

- `/build` - Run production build and report errors
- `/lint` - Run linting and fix issues
- `/test-component <name>` - Test a specific component
- `/add-section <name>` - Guide for adding a new resume section
- `/review-pr <number>` - Review a pull request
- `/preflight` - Run preflight checks before PR/deploy
- `/debug <issue>` - Help debug an issue

## Configuration

The `settings.local.json` file contains project-specific Claude Code settings including:
- Custom instructions
- File patterns to include/exclude
- Project-specific context

## Documentation

For comprehensive project documentation, see:
- [`../CLAUDE.md`](../CLAUDE.md) - Main Claude Code documentation
- [`../docs/`](../docs/) - Detailed project documentation
- [`../README.md`](../README.md) - Project overview

## Best Practices

When working with Claude Code on this project:

1. **Always check CLAUDE.md first** for project-specific patterns
2. **Use custom commands** for common tasks
3. **Follow error handling patterns** defined in the documentation
4. **Use the logger service** instead of console.log
5. **Write tests** for new features
6. **Update documentation** when making significant changes
