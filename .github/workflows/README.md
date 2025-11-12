# GitHub CI/CD Workflows

This directory contains GitHub Actions workflows for the md2doc project.

## Workflows

### 1. CI (`ci.yml`)
**Trigger**: Push to main/develop branches, Pull Requests

**Purpose**: Continuous Integration - tests and validates code changes

**Jobs**:
- **test**: Runs tests on Node.js 18.x and 20.x
  - Installs Chromium for Puppeteer tests
  - Runs linter
  - Builds project
  - Executes test suite
  - Uploads coverage reports

- **lint**: Code quality checks
  - ESLint validation

- **build**: Validates build artifacts
  - Builds CLI and Core library
  - Builds VSCode extension
  - Validates output files

### 2. Release (`release.yml`)
**Trigger**: Git tags matching `v*.*.*` pattern, Manual workflow dispatch

**Purpose**: Automated release process for all components

**Jobs**:
- **build**: Builds all packages
  - Runs full test suite
  - Creates NPM package tarball
  - Builds VSCode extension (.vsix)
  - Uploads artifacts

- **release**: Creates GitHub Release
  - Extracts changelog for the version
  - Creates release with artifacts
  - Attaches NPM package and VSCode extension

- **publish-npm**: Publishes to NPM registry
  - Requires `NPM_TOKEN` secret
  - Publishes md2doc package

- **publish-vscode**: Publishes to VS Code Marketplace
  - Requires `VSCE_TOKEN` secret
  - Publishes VSCode extension

### 3. Nightly (`nightly.yml`)
**Trigger**: Daily at 2 AM UTC, Manual workflow dispatch

**Purpose**: Creates nightly development builds

**Jobs**:
- **nightly**: Builds from develop branch
  - Runs tests (continues on failure)
  - Creates NPM package
  - Builds VSCode extension
  - Uploads artifacts with date stamp
  - Creates/updates 'nightly' prerelease tag

### 4. CodeQL (`codeql.yml`)
**Trigger**: Push to main/develop, Pull Requests, Weekly schedule (Mondays 6 AM UTC)

**Purpose**: Security vulnerability analysis

**Jobs**:
- **analyze**: Runs CodeQL security scanning
  - Uses security-extended and security-and-quality queries
  - Automatically builds and analyzes JavaScript/TypeScript

### 5. Docker (`docker.yml`)
**Trigger**: Git tags matching `v*.*.*` pattern, Manual workflow dispatch

**Purpose**: Builds and publishes Docker images

**Jobs**:
- **docker**: Multi-platform Docker build
  - Builds for linux/amd64 and linux/arm64
  - Pushes to GitHub Container Registry (ghcr.io)
  - Tags with version, major.minor, major, sha, and latest

## Required Secrets

To use all workflows, configure these secrets in your repository settings:

### NPM Publishing
- `NPM_TOKEN`: NPM access token for publishing packages
  - Get from: https://www.npmjs.com/settings/[username]/tokens
  - Type: Automation token

### VSCode Extension Publishing
- `VSCE_TOKEN`: Visual Studio Marketplace Personal Access Token
  - Get from: https://dev.azure.com/[publisher]/_usersSettings/tokens
  - Type: Marketplace (full access)

### Optional
- `CODECOV_TOKEN`: For code coverage reports (optional)
  - Get from: https://codecov.io/

## Release Process

### Automatic Release (Recommended)

1. Update version in `package.json` and `vscode-extension/package.json`
2. Update `CHANGELOG.md` with changes for the new version
3. Commit changes: `git commit -am "Release v1.0.0"`
4. Create and push tag: `git tag v1.0.0 && git push origin v1.0.0`
5. GitHub Actions will automatically:
   - Run tests
   - Build all packages
   - Create GitHub Release with artifacts
   - Publish to NPM (if `NPM_TOKEN` is set)
   - Publish to VS Code Marketplace (if `VSCE_TOKEN` is set)

### Manual Release

1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Enter version number (e.g., 1.0.0)
4. Click "Run workflow"

## Docker Usage

### Pull from GitHub Container Registry

```bash
docker pull ghcr.io/gowerlin/md2doc:latest
# or specific version
docker pull ghcr.io/gowerlin/md2doc:1.0.0
```

### Run Docker Container

```bash
# Convert a single file
docker run -v $(pwd):/workspace ghcr.io/gowerlin/md2doc:latest convert example.md -o output.docx

# Batch convert
docker run -v $(pwd):/workspace ghcr.io/gowerlin/md2doc:latest batch "docs/**/*.md" -o output/

# List themes
docker run ghcr.io/gowerlin/md2doc:latest themes
```

## Workflow Status Badges

Add these badges to your README.md:

```markdown
[![CI](https://github.com/gowerlin/md2doc/actions/workflows/ci.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/ci.yml)
[![Release](https://github.com/gowerlin/md2doc/actions/workflows/release.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/release.yml)
[![CodeQL](https://github.com/gowerlin/md2doc/actions/workflows/codeql.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/codeql.yml)
[![Docker](https://github.com/gowerlin/md2doc/actions/workflows/docker.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/docker.yml)
```

## Troubleshooting

### Release workflow fails at NPM publish
- Ensure `NPM_TOKEN` secret is set correctly
- Verify the token has publish permissions
- Check if package name is available on NPM

### VSCode extension publish fails
- Ensure `VSCE_TOKEN` secret is set correctly
- Verify token has Marketplace (publish) permissions
- Check publisher name in vscode-extension/package.json

### Docker build fails
- Check Dockerfile syntax
- Ensure all dependencies are properly installed
- Verify multi-platform build support

### Tests fail in CI but pass locally
- Check Node.js version differences
- Verify Chromium/Puppeteer is properly installed in CI
- Check environment variables (PUPPETEER_EXECUTABLE_PATH)

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act -j test

# Run build job
act -j build

# List available workflows
act -l
```

## Monitoring

- View workflow runs: https://github.com/gowerlin/md2doc/actions
- Check releases: https://github.com/gowerlin/md2doc/releases
- View packages: https://github.com/gowerlin/md2doc/pkgs/container/md2doc
