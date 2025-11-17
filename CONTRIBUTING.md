# Contributing to md2doc

Thank you for your interest in contributing to md2doc! This document provides guidelines for contributing to the project.

## Branching Strategy

This project follows a Git Flow branching model:

### Main Branches

- **`main`**: Production-ready code. All releases are tagged from this branch.
- **`develop`**: Integration branch for features. This is the main development branch where features are merged before being released to `main`.

### Supporting Branches

- **Feature branches**: Branch from `develop` for new features
  - Naming: `feature/feature-name` or `copilot/feature-name`
  - Merge back to: `develop`

- **Hotfix branches**: Branch from `main` for urgent production fixes
  - Naming: `hotfix/issue-description`
  - Merge back to: both `main` and `develop`

- **Release branches**: Branch from `develop` when preparing a new release
  - Naming: `release/v1.0.0`
  - Merge back to: both `main` and `develop`

## Setting Up the Develop Branch

If the `develop` branch doesn't exist yet, repository maintainers can use the automated setup script:

```bash
# Clone the repository
git clone https://github.com/gowerlin/md2doc.git
cd md2doc

# Run the setup script
bash setup-develop-branch.sh
```

The script will create the develop branch from main and push it to origin with confirmation prompts.

## Development Workflow

### For New Features

1. **Create a feature branch from `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write code following the project's coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm install
   npm run build
   npm run lint
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a PR against the `develop` branch
   - Fill in the PR template with details about your changes
   - Wait for code review and CI checks to pass

### For Bug Fixes

Follow the same workflow as features, but use `bugfix/` prefix:
```bash
git checkout -b bugfix/fix-description
```

### For Hotfixes

1. **Branch from `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. **Make the fix and test thoroughly**

3. **Create PRs to both `main` and `develop`**

## Code Quality Standards

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Run `npm run lint` before committing
- Write meaningful commit messages

### Testing

- Write unit tests for new functionality
- Ensure all tests pass: `npm test`
- Maintain test coverage above 80%
- Add integration tests for major features

### Documentation

- Update README.md if adding new features
- Add JSDoc comments for public APIs
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format

## Pull Request Process

1. **Before submitting**:
   - Ensure all tests pass
   - Run the linter and fix any issues
   - Update documentation
   - Rebase on the latest `develop` if needed

2. **PR Description**:
   - Clearly describe the changes
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Code Review**:
   - Address review feedback promptly
   - Keep the PR focused and small when possible
   - Be open to suggestions and improvements

4. **After Approval**:
   - Ensure CI/CD checks pass
   - Squash commits if requested
   - Wait for a maintainer to merge

## Release Process

Releases are managed by maintainers:

1. Create a release branch from `develop`
2. Update version numbers and CHANGELOG
3. Create PR to `main`
4. After merge, tag the release
5. Merge back to `develop`

## Development Environment

### Requirements

- Node.js 18+
- npm or yarn
- TypeScript (see `package.json` for version requirements)
- (Optional) Chromium for PDF/Mermaid features

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development instructions.

## Getting Help

- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README.md and docs/ directory

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow the project's coding standards

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers if you have any questions about contributing!
