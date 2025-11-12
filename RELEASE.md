# Release Guide

This guide explains how to create releases for the md2doc project.

## Overview

The md2doc project uses automated GitHub Actions workflows for releases. Each release includes:

1. **NPM Package** (`md2doc`): Core library and CLI tool
2. **VSCode Extension** (`md2doc-vscode`): VSCode extension (.vsix)
3. **Docker Image** (`ghcr.io/gowerlin/md2doc`): Containerized CLI
4. **GitHub Release**: With downloadable artifacts

## Prerequisites

### Required Secrets

Configure these in GitHub repository settings → Secrets and variables → Actions:

1. **NPM_TOKEN**: For publishing to NPM registry
   - Go to https://www.npmjs.com/settings/[username]/tokens
   - Create "Automation" token with "Read and Publish" permissions
   - Add to GitHub secrets as `NPM_TOKEN`

2. **VSCE_TOKEN**: For publishing VSCode extension
   - Go to https://dev.azure.com/[publisher]/_usersSettings/tokens
   - Create Personal Access Token with Marketplace (Publish) permissions
   - Add to GitHub secrets as `VSCE_TOKEN`

3. **GITHUB_TOKEN**: Automatically provided (no action needed)

## Release Types

### 1. Stable Release (Recommended)

For production-ready releases with semantic versioning.

#### Steps:

1. **Update Version Numbers**

   ```bash
   # For patch release (0.5.0 → 0.5.1)
   npm run release:patch
   
   # For minor release (0.5.0 → 0.6.0)
   npm run release:minor
   
   # For major release (0.5.0 → 1.0.0)
   npm run release:major
   ```

   Or manually:
   ```bash
   # Update root package.json
   npm version 0.6.0
   
   # Update VSCode extension package.json
   cd vscode-extension
   npm version 0.6.0
   cd ..
   ```

2. **Update CHANGELOG.md**

   Add a new section for the version:

   ```markdown
   ## [0.6.0] - 2024-01-15
   
   ### Added
   - New feature X
   - New feature Y
   
   ### Fixed
   - Bug fix A
   - Bug fix B
   
   ### Changed
   - Enhancement C
   ```

3. **Commit and Tag**

   ```bash
   git add .
   git commit -m "Release v0.6.0"
   git tag v0.6.0
   git push origin main --tags
   ```

4. **Automated Workflow**

   GitHub Actions will automatically:
   - ✓ Run all tests
   - ✓ Build NPM package
   - ✓ Build VSCode extension
   - ✓ Create GitHub Release with artifacts
   - ✓ Publish to NPM (if NPM_TOKEN exists)
   - ✓ Publish to VS Code Marketplace (if VSCE_TOKEN exists)
   - ✓ Build and push Docker images

5. **Verify Release**

   - Check: https://github.com/gowerlin/md2doc/releases
   - Check: https://www.npmjs.com/package/md2doc
   - Check: https://marketplace.visualstudio.com/items?itemName=md2doc.md2doc-vscode
   - Check: https://github.com/gowerlin/md2doc/pkgs/container/md2doc

### 2. Manual Release (Alternative)

If you need to create a release without pushing a tag:

1. Go to: https://github.com/gowerlin/md2doc/actions/workflows/release.yml
2. Click "Run workflow"
3. Enter version number (e.g., `0.6.0`)
4. Click "Run workflow"

### 3. Nightly/Beta Releases

For development builds:

1. **Automatic Nightly**: Runs daily at 2 AM UTC from `develop` branch
   - Creates/updates `nightly` prerelease tag
   - Includes date stamp in artifacts

2. **Manual Nightly**:
   - Go to: https://github.com/gowerlin/md2doc/actions/workflows/nightly.yml
   - Click "Run workflow"

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Major (1.0.0)**: Breaking changes
- **Minor (0.6.0)**: New features (backward compatible)
- **Patch (0.5.1)**: Bug fixes (backward compatible)

### Examples:

- `0.5.1` → Bug fix release
- `0.6.0` → New features added
- `1.0.0` → First stable release or breaking changes

## Release Checklist

Before creating a release:

- [ ] All tests pass locally (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] CHANGELOG.md is updated
- [ ] Version numbers updated in both package.json files
- [ ] Documentation is up to date
- [ ] All PRs for this release are merged
- [ ] Branch is up to date with main/develop

## Post-Release Tasks

After release is created:

1. **Announce Release**
   - Post to project discussions
   - Update documentation site
   - Notify users

2. **Verify Installations**
   ```bash
   # Test NPM package
   npm install -g md2doc@latest
   md2doc --version
   
   # Test Docker image
   docker pull ghcr.io/gowerlin/md2doc:latest
   docker run ghcr.io/gowerlin/md2doc:latest --version
   ```

3. **Monitor Issues**
   - Watch for bug reports
   - Check GitHub Issues
   - Monitor NPM download stats

## Rollback

If a release has critical issues:

1. **Quick Fix**:
   ```bash
   # Fix the issue
   git commit -am "Fix critical bug"
   
   # Create patch release
   npm run release:patch
   ```

2. **Deprecate Release**:
   ```bash
   # Deprecate on NPM
   npm deprecate md2doc@0.6.0 "Critical bug, use 0.6.1 instead"
   ```

3. **Delete GitHub Release** (last resort):
   - Go to Releases page
   - Edit or delete problematic release
   - Delete associated tag

## Troubleshooting

### NPM Publish Fails

**Issue**: `E403 Forbidden`

**Solution**:
- Verify NPM_TOKEN secret is set correctly
- Check token has publish permissions
- Ensure package name is not taken
- Verify you're logged in: `npm whoami`

### VSCode Extension Publish Fails

**Issue**: `Failed to publish`

**Solution**:
- Verify VSCE_TOKEN secret is set
- Check token has Marketplace permissions
- Verify publisher name in vscode-extension/package.json
- Manual publish: `cd vscode-extension && npx vsce publish`

### Docker Build Fails

**Issue**: Build errors or image too large

**Solution**:
- Check Dockerfile syntax
- Verify .dockerignore excludes unnecessary files
- Test locally: `docker build -t md2doc:test .`
- Check multi-platform support

### GitHub Release Not Created

**Issue**: Release workflow completes but no release

**Solution**:
- Check workflow logs for errors
- Verify GITHUB_TOKEN has permissions
- Ensure tag matches pattern `v*.*.*`
- Check CHANGELOG.md has entry for version

### Tests Fail in CI

**Issue**: Tests pass locally but fail in CI

**Solution**:
- Check Node.js version differences
- Verify Chromium is installed in CI
- Check environment variables
- Run tests locally with: `act -j test`

## Release Workflow Diagram

```
Developer Push Tag (v0.6.0)
         ↓
   GitHub Actions
         ↓
    ┌────────────┐
    │   Build    │ → Run Tests
    │   Job      │ → Build All
    └────────────┘
         ↓
    ┌────────────┐
    │  Release   │ → Create GitHub Release
    │   Job      │ → Attach Artifacts
    └────────────┘
         ↓
    ┌─────────────────┬─────────────────┐
    │                 │                 │
    │  Publish NPM    │  Publish VSCode │  Docker Build
    │                 │                 │
    └─────────────────┴─────────────────┘
         ↓
    ✓ Release Complete
```

## Testing Releases Locally

Before pushing tags, test the build process:

```bash
# Test NPM package
npm run build
npm pack
npm install -g ./md2doc-0.6.0.tgz
md2doc --version

# Test VSCode extension
cd vscode-extension
npm run compile
npm run package
code --install-extension md2doc-vscode-0.6.0.vsix

# Test Docker build
docker build -t md2doc:test .
docker run -v $(pwd):/workspace md2doc:test convert example.md
```

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

## Support

For release issues:
- Open an issue: https://github.com/gowerlin/md2doc/issues
- Check workflow logs: https://github.com/gowerlin/md2doc/actions
- Review documentation: https://github.com/gowerlin/md2doc/blob/main/.github/workflows/README.md
