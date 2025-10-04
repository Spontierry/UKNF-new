# 🤖 Commit Agent

## Overview

The Commit Agent is responsible for analyzing code changes and generating conventional commit messages that follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Capabilities

### 🔍 Change Analysis

- Analyzes git diffs to understand what files have been modified
- Identifies the type of changes (features, bug fixes, documentation, etc.)
- Detects breaking changes and scope of modifications

### 📝 Commit Message Generation

- Generates concise, descriptive commit messages
- Follows conventional commit format: `type(scope): description`
- Includes breaking change indicators when appropriate
- Suggests appropriate commit types based on changes

## Supported Commit Types

### Core Types

- **feat**: New features or functionality
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes (formatting, whitespace)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks, dependency updates

### Special Types

- **build**: Build system or external dependencies
- **ci**: CI/CD pipeline changes
- **revert**: Reverting previous commits

## Usage Examples

### Feature Addition

```
feat(auth): add OAuth2 authentication flow

- Implement Google OAuth2 integration
- Add user session management
- Update authentication middleware
```

### Bug Fix

```
fix(database): resolve connection timeout issue

- Increase connection pool size
- Add retry logic for failed connections
- Update error handling
```

### Documentation

```
docs(api): update authentication endpoints documentation

- Add OAuth2 flow examples
- Document error response formats
- Include rate limiting information
```

### Breaking Change

```
feat(api)!: migrate to v2 authentication endpoints

BREAKING CHANGE: Old /auth/login endpoint is deprecated.
Use /v2/auth/login instead.

- Remove deprecated endpoints
- Update authentication flow
- Add migration guide
```

## Implementation Guidelines

### Message Structure

1. **Type**: Use lowercase, specific commit type
2. **Scope**: Optional, indicates the area affected
3. **Description**: Imperative mood, max 50 characters
4. **Body**: Detailed explanation if needed
5. **Footer**: Breaking changes, issue references

### Best Practices

- Keep the subject line under 50 characters
- Use imperative mood ("add" not "added")
- Be specific about what changed
- Include context when necessary
- Reference issues with "Closes #123"

### Scope Examples

- `auth` - Authentication related changes
- `api` - API endpoints and responses
- `ui` - User interface components
- `db` - Database schema or queries
- `config` - Configuration files
- `deps` - Dependency updates

## Analysis Patterns

### File Change Patterns

- **New files**: Usually `feat` or `docs`
- **Modified existing**: Depends on content changes
- **Deleted files**: Usually `refactor` or `feat`
- **Configuration changes**: Often `config` or `chore`
- **Test files**: Usually `test` or `feat`/`fix`

### Content Analysis

- Look for keywords indicating change type
- Check for breaking changes (removed APIs, changed signatures)
- Identify affected components or modules
- Detect if changes are user-facing or internal

## Error Handling

### Invalid Changes

If changes cannot be analyzed:

```
chore: update files

Unable to determine specific change type.
Please review and commit manually if needed.
```

### Multiple Change Types

When changes span multiple types:

```
feat: add new features and fix bugs

- Add user dashboard (feat)
- Fix authentication timeout (fix)
- Update documentation (docs)
```

## Integration

This agent can be integrated with:

- Git hooks for automatic commit message generation
- CI/CD pipelines for change analysis
- Code review tools for context
- Project management tools for issue linking

## Example Workflow

1. **Analyze Changes**: Review git diff for modified files
2. **Determine Type**: Identify the primary change type
3. **Extract Scope**: Find the affected component/module
4. **Generate Description**: Create concise summary
5. **Add Details**: Include breaking changes or issue references
6. **Validate**: Ensure message follows conventional format

## Notes

- Always review generated messages before committing
- Customize scope names to match your project structure
- Consider team conventions for commit message style
- Use conventional commits for automated changelog generation
