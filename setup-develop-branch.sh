#!/bin/bash
#
# Setup script to create the develop branch for md2doc repository
# This script should be run by a repository maintainer with push access
#

set -e  # Exit on error

echo "================================================"
echo "md2doc - Setup Develop Branch"
echo "================================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    echo "Please run this script from the root of the md2doc repository"
    exit 1
fi

# Check if we're in the md2doc repository
if ! git remote get-url origin | grep -q "md2doc"; then
    echo "Warning: This doesn't appear to be the md2doc repository"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Step 1: Fetching latest changes from origin..."
git fetch origin

echo ""
echo "Step 2: Checking if develop branch already exists..."
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✓ Develop branch already exists locally"
    LOCAL_DEVELOP_EXISTS=true
else
    echo "✗ Develop branch does not exist locally"
    LOCAL_DEVELOP_EXISTS=false
fi

if git show-ref --verify --quiet refs/remotes/origin/develop; then
    echo "✓ Develop branch already exists on remote"
    REMOTE_DEVELOP_EXISTS=true
else
    echo "✗ Develop branch does not exist on remote"
    REMOTE_DEVELOP_EXISTS=false
fi

if [ "$REMOTE_DEVELOP_EXISTS" = true ]; then
    echo ""
    echo "The develop branch already exists on the remote repository."
    if [ "$LOCAL_DEVELOP_EXISTS" = false ]; then
        echo "Setting up local tracking branch..."
        git checkout -b develop origin/develop
        echo "✓ Local develop branch created and tracking origin/develop"
    else
        git checkout develop
        git pull origin develop
        echo "✓ Local develop branch updated"
    fi
    echo ""
    echo "Setup complete! The develop branch is ready."
    exit 0
fi

echo ""
echo "Step 3: Creating develop branch from main..."

# Ensure we have the latest main
echo "Checking out main branch..."
git checkout main
echo "Pulling latest changes from origin/main..."
git pull origin main

# Create develop branch
echo "Creating develop branch..."
git checkout -b develop

echo ""
echo "Step 4: Pushing develop branch to origin..."
echo ""
echo "This will create the develop branch on GitHub."
read -p "Proceed with pushing? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Aborted. The develop branch was created locally but not pushed."
    echo "You can push it later with: git push -u origin develop"
    exit 0
fi

git push -u origin develop

echo ""
echo "================================================"
echo "✓ Success!"
echo "================================================"
echo ""
echo "The develop branch has been created and pushed to origin."
echo ""
echo "Branch structure:"
echo "  - main: Production releases"
echo "  - develop: Integration branch for development"
echo ""
echo "Next steps:"
echo "  - Create feature branches from develop"
echo "  - See CONTRIBUTING.md for workflow details"
echo "  - CI/CD workflows are already configured to use develop"
echo ""
