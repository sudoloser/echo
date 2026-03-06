# Contributing to Echo

Thank you for your interest in contributing to **Echo**! We appreciate your help in making this lyric editor even better.

## How to Contribute

### Reporting Bugs

-   Check if the bug has already been reported in the [Issues](https://github.com/explysm/echo/issues) tab.
-   If it hasn't, open a new issue.
-   Include as much detail as possible: steps to reproduce, device information, and screenshots if applicable.

### Suggesting Features

-   Open an issue to discuss your idea.
-   Provide a clear explanation of the feature and its benefits.

### Pull Requests (PRs)

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix: `git checkout -b my-feature`.
3.  Commit your changes following the project's coding style (Clean, TypeScript, minimalist).
4.  Push your branch to your fork: `git push origin my-feature`.
5.  Open a Pull Request against the `main` branch.

## Development Setup

We use **pnpm** as our package manager. Please ensure you have it installed before starting development.

```bash
pnpm install
pnpm start
```

## Code Style

-   Use TypeScript for all new code.
-   Follow existing naming conventions (camelCase for variables, PascalCase for components).
-   Keep components small, focused, and reusable.
-   Prefer Vanilla CSS via `StyleSheet` over TailwindCSS for this project.

## CI/CD

Our GitHub Workflow will automatically run on every PR to ensure the project still builds correctly. Please make sure your changes do not break the Android build.

---
By contributing to this project, you agree that your contributions will be licensed under the project's license.
